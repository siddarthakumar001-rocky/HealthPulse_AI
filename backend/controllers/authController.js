const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../services/auditService');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || "healthpulse_fallback_secret_2026_secure_default";
if (!process.env.JWT_SECRET) {
  logger.warn('[SECURITY WARNING] JWT_SECRET is missing in environment variables. Set a strong JWT_SECRET in production.');
}

const SALT_ROUNDS = 12;

exports.signup = async (req, res) => {
  try {
    const { email, password, data } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ 
      email: normalizedEmail, 
      password: hashedPassword, 
      loginCount: 1, 
      lastLogin: new Date(), 
      ...data 
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });

    await logAudit({
      userId: newUser._id,
      action: 'USER_SIGNUP',
      req,
      details: { email: newUser.email }
    });

    res.status(201).json({ 
      session: { access_token: token },
      user: { id: newUser._id, email: newUser.email, user_metadata: data } 
    });
  } catch (err) {
    logger.error('[Auth Signup Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    
    // Configurable Admin credentials with fallback
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@@@123';

    if (normalizedEmail === adminEmail && password === adminPassword) {
       let adminUser = await User.findOne({ email: adminEmail });
       if (!adminUser) {
         adminUser = new User({ email: adminEmail, password: await bcrypt.hash(password, SALT_ROUNDS), role: 'admin' });
         await adminUser.save();
       }

       const token = jwt.sign({ id: adminUser._id, role: 'admin', email: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
       
       await logAudit({
         userId: adminUser._id,
         action: 'ADMIN_LOGIN',
         req,
         details: { email: 'admin' }
       });

       return res.json({
         session: { access_token: token },
         user: { id: adminUser._id, email: 'admin', role: 'admin', user_metadata: { name: 'Admin' } },
         onboarding_completed: true,
         requires_emergency_contact: false
       });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      await logAudit({
        userId: normalizedEmail || 'UNKNOWN',
        action: 'LOGIN_FAILED',
        status: 'FAILURE',
        req,
        details: { reason: 'User not found' }
      });
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAudit({
        userId: user._id,
        action: 'LOGIN_FAILED',
        status: 'FAILURE',
        req,
        details: { reason: 'Password mismatch' }
      });
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update login tracking atomically
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role || 'user', email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Check onboarding
    const OnboardingData = require('../models/OnboardingData');
    const onboarding = await OnboardingData.findOne({ user_id: user._id });

    await logAudit({
      userId: user._id,
      action: 'USER_LOGIN',
      req,
      details: { email: user.email }
    });

    const hasEmergency = !!(user.emergency_contact || onboarding?.emergency_contact || onboarding?.emergencyContact);
    
    res.json({
      session: { access_token: token },
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role || 'user',
        user_metadata: { 
          name: user.name, 
          phone: user.phone, 
          age: user.age, 
          gender: user.gender,
          emergency_contact: user.emergency_contact || onboarding?.emergency_contact || '',
          emergency_contact_name: user.emergency_contact_name || ''
        } 
      },
      onboarding_completed: !!onboarding,
      requires_emergency_contact: !hasEmergency
    });
  } catch (err) {
    logger.error('[Auth Login Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

/**
 * Direct Google Authentication & Gmail Sync
 * Cryptographically verifies Google ID Token via Google's tokeninfo API.
 * Guarantees that only authentic, Google-verified emails can register or log in.
 * Enforces emergency contact collection for IoMT clinical safety.
 */
exports.googleAuth = async (req, res) => {
  try {
    const { credential, emergency_contact, emergency_contact_name } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    // Query Google OAuth2 TokenInfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) {
      const errText = await response.text();
      logger.warn('[Google Auth] Tokeninfo verification failed:', { status: response.status, errText });
      return res.status(401).json({ error: 'Invalid or expired Google authentication credential' });
    }

    const payload = await response.json();

    // Verify audience matches our authorized Web Client ID
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '363766926067-vph1ues751u8t6sjf3te9v2mcc941qr0.apps.googleusercontent.com';
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      logger.warn('[Google Auth] Client ID audience mismatch:', { tokenAud: payload.aud, expectedAud: GOOGLE_CLIENT_ID });
      return res.status(401).json({ error: 'Google Token audience mismatch: unauthorized client' });
    }

    // STRICT CHECK: Reject unauthorized / unverified emails
    const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!isEmailVerified) {
      logger.warn('[Google Auth] Blocked unverified email attempt:', { email: payload.email });
      return res.status(403).json({ 
        error: 'Security Block: Your Google email is not verified. Only authentic, Google-verified accounts are allowed.' 
      });
    }

    if (!payload.email) {
      return res.status(400).json({ error: 'Google authentication profile does not provide a valid email address.' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new authentic Google-verified user
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, SALT_ROUNDS);

      user = new User({
        email: normalizedEmail,
        password: hashedPassword,
        name: payload.name || payload.given_name || normalizedEmail.split('@')[0],
        avatar: payload.picture || '',
        googleId: payload.sub,
        emergency_contact: emergency_contact ? emergency_contact.trim() : '',
        emergency_contact_name: emergency_contact_name ? emergency_contact_name.trim() : '',
        isGoogleAuth: true,
        loginCount: 1,
        lastLogin: new Date(),
        role: 'user'
      });
      await user.save();

      await logAudit({
        userId: user._id,
        action: 'GOOGLE_USER_SIGNUP',
        req,
        details: { email: user.email, googleId: payload.sub, name: user.name }
      });
    } else {
      // Update existing user with Google sync info
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = new Date();
      if (!user.googleId) user.googleId = payload.sub;
      if (!user.name && payload.name) user.name = payload.name;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      if (emergency_contact && !user.emergency_contact) {
        user.emergency_contact = emergency_contact.trim();
        if (emergency_contact_name) user.emergency_contact_name = emergency_contact_name.trim();
      }
      user.isGoogleAuth = true;
      await user.save();

      await logAudit({
        userId: user._id,
        action: 'GOOGLE_USER_LOGIN',
        req,
        details: { email: user.email, googleId: payload.sub }
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || 'user', email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const OnboardingData = require('../models/OnboardingData');
    const onboarding = await OnboardingData.findOne({ user_id: user._id });

    // Check emergency contact presence
    const hasEmergencyContact = !!(
      (user.emergency_contact && user.emergency_contact.trim().length > 0) ||
      (onboarding?.emergency_contact && onboarding.emergency_contact.trim().length > 0) ||
      (onboarding?.emergencyContact && onboarding.emergencyContact.trim().length > 0)
    );

    return res.json({
      session: { access_token: token },
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'user',
        user_metadata: {
          name: user.name || payload.name,
          avatar: user.avatar || payload.picture,
          phone: user.phone,
          age: user.age,
          gender: user.gender,
          emergency_contact: user.emergency_contact || onboarding?.emergency_contact || '',
          emergency_contact_name: user.emergency_contact_name || ''
        }
      },
      requires_emergency_contact: !hasEmergencyContact,
      onboarding_completed: !!onboarding
    });
  } catch (err) {
    logger.error('[Auth Google Login Error]:', { error: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Google authentication processing failed: ' + err.message });
  }
};

/**
 * Update Emergency Contact directly for active user
 */
exports.updateEmergencyContact = async (req, res) => {
  try {
    const { emergency_contact, emergency_contact_name } = req.body;
    if (!emergency_contact || emergency_contact.trim().length < 5) {
      return res.status(400).json({ error: 'A valid emergency contact phone number is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.emergency_contact = emergency_contact.trim();
    if (emergency_contact_name) user.emergency_contact_name = emergency_contact_name.trim();
    await user.save();

    // Also update OnboardingData if present
    const OnboardingData = require('../models/OnboardingData');
    await OnboardingData.findOneAndUpdate(
      { user_id: user._id },
      { $set: { emergency_contact: user.emergency_contact, emergencyContact: user.emergency_contact } }
    );

    await logAudit({
      userId: user._id,
      action: 'EMERGENCY_CONTACT_UPDATED',
      req,
      details: { emergency_contact: user.emergency_contact }
    });

    return res.json({
      success: true,
      message: 'Emergency contact successfully registered.',
      emergency_contact: user.emergency_contact,
      emergency_contact_name: user.emergency_contact_name
    });
  } catch (err) {
    logger.error('[Update Emergency Contact Error]:', { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        user_metadata: { 
          name: user.name, 
          phone: user.phone, 
          age: user.age, 
          gender: user.gender,
          emergency_contact: user.emergency_contact,
          emergency_contact_name: user.emergency_contact_name
        } 
      } 
    });
  } catch (err) {
    logger.error('[Auth GetUser Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
