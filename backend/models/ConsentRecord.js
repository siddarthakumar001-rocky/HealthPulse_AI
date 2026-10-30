const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  granteeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true
  },
  purpose: {
    type: String,
    enum: ['remote_monitoring', 'clinical_consultation', 'emergency_triage', 'caregiver_support'],
    required: true
  },
  dataCategories: [{
    type: String,
    enum: ['vitals', 'medical_reports', 'activity_telemetry', 'digital_twin']
  }],
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
    index: true
  },
  grantedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  auditMetadata: {
    ipAddress: { type: String, default: 'UNKNOWN' },
    userAgent: { type: String, default: 'UNKNOWN' }
  }
}, {
  timestamps: true
});

consentRecordSchema.index({ patientId: 1, granteeId: 1, status: 1 });
consentRecordSchema.index({ granteeId: 1, status: 1 });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);
