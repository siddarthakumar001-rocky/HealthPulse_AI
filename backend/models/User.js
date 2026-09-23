const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'phc_staff', 'dho', 'system_admin'], default: 'user', index: true },
    loginCount: { type: Number, default: 1 },
    lastLogin: { type: Date, default: Date.now }
  }, { 
    strict: false,
    timestamps: true 
  });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
