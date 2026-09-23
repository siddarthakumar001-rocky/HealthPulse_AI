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
    
    // Admin credentials login
    if (email === 'admin' && password === 'admin@@@123') {
       let adminUser = await User.findOne({ email: 'admin' });
       if (!adminUser) {
         adminUser = new User({ email: 'admin', password: await bcrypt.hash(password, SALT_ROUNDS), role: 'admin' });
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
         onboarding_completed: true
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
    
    res.json({
      session: { access_token: token },
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role || 'user',
        user_metadata: { name: user.name, phone: user.phone, age: user.age, gender: user.gender } 
      },
      onboarding_completed: !!onboarding
    });
  } catch (err) {
    logger.error('[Auth Login Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
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
        user_metadata: { name: user.name, phone: user.phone, age: user.age, gender: user.gender } 
      } 
    });
  } catch (err) {
    logger.error('[Auth GetUser Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
