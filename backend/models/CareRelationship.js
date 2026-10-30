const mongoose = require('mongoose');

const careRelationshipSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  partnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  relationshipType: {
    type: String,
    enum: ['caregiver', 'family', 'doctor', 'clinician'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'revoked', 'expired'],
    default: 'pending',
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true
  },
  invitationCode: {
    type: String,
    sparse: true,
    index: true
  },
  scopes: [{
    type: String,
    enum: ['vitals_read', 'reports_read', 'alerts_receive', 'care_plan_manage']
  }],
  grantedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null }
}, {
  timestamps: true
});

careRelationshipSchema.index({ patientId: 1, partnerId: 1, relationshipType: 1 }, { unique: true });
careRelationshipSchema.index({ partnerId: 1, status: 1 });
careRelationshipSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('CareRelationship', careRelationshipSchema);
