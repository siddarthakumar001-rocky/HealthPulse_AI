const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type: { 
    type: String, 
    enum: ['clinic', 'hospital', 'phc_center', 'community_network'], 
    default: 'clinic' 
  },
  contact: {
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  isActive: { type: Boolean, default: true, index: true },
  settings: {
    allowEmergencyEscalation: { type: Boolean, default: true },
    retentionDays: { type: Number, default: 365 }
  }
}, {
  timestamps: true
});

organizationSchema.index({ code: 1 }, { unique: true });
organizationSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Organization', organizationSchema);
