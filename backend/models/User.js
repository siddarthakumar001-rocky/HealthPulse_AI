const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: false },
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    emergency_contact: { type: String, default: '' },
    emergency_contact_name: { type: String, default: '' },
    googleId: { type: String, default: null, index: true },
    isGoogleAuth: { type: Boolean, default: false },
    role: { 
      type: String, 
      enum: ['user', 'patient', 'caregiver', 'doctor', 'clinic_admin', 'phc_staff', 'dho', 'admin', 'system_admin'], 
      default: 'user', 
      index: true 
    },
    organizationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Organization', 
      default: null, 
      index: true 
    },
    loginCount: { type: Number, default: 1 },
    lastLogin: { type: Date, default: Date.now }
  }, { 
    strict: false,
    timestamps: true 
  });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
