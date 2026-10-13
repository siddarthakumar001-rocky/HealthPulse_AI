const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical', 'warning', 'info'], default: 'low', index: true },
  resolved: { type: Boolean, default: false, index: true },
  // IEEE Paper Context-Aware Sentinel fields (backward-compatible)
  vital: { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
  activity: { type: String },
  signalQuality: { type: String },
  provenance: { type: String, enum: ['SENSOR', 'CSDI_RECONSTRUCTED', 'FORECAST', 'sensor', 'csdi_reconstructed', 'forecast'], default: 'SENSOR' },
  persistence: { type: String },
  reason: { type: String },
  decisionRule: { type: String },
  recommendedAction: { type: String }
}, { 
  strict: false, 
  timestamps: true 
});

alertSchema.index({ user_id: 1, createdAt: -1 });
alertSchema.index({ user_id: 1, resolved: 1, severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
