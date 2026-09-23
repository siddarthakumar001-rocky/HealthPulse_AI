const mongoose = require('mongoose');

const phcAlertSchema = new mongoose.Schema({
  phcId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  alertType: { 
    type: String, 
    enum: [
      'STOCKOUT_RISK', 
      'OUTBREAK_SURGE', 
      'COLD_CHAIN_BREACH', 
      'EQUIPMENT_FAILURE', 
      'CAPACITY_OVERLOAD', 
      'EXPIRY_WARNING', 
      'CONNECTIVITY_LOSS',
      'STAFF_DEFICIT'
    ],
    required: true,
    index: true 
  },
  severity: { 
    type: String, 
    enum: ['Info', 'Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium',
    index: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  triggerSource: { type: String, default: 'AI Prediction Engine' }, // AI Prediction Engine, IoT Cold Chain, Footfall Anomaly, Manual
  detectedValue: { type: mongoose.Schema.Types.Mixed },
  threshold: { type: mongoose.Schema.Types.Mixed },
  aiConfidence: { type: Number, min: 0, max: 100, default: 88 },
  recommendedAction: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Detected', 'Prioritized', 'Assigned', 'Acknowledged', 'Action Taken', 'Resolved'], 
    default: 'Detected',
    index: true 
  },
  createdAt: { type: Date, default: Date.now, index: true },
  acknowledgedAt: { type: Date },
  acknowledgedBy: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolutionNotes: { type: String }
}, {
  timestamps: true
});

phcAlertSchema.index({ phcId: 1, status: 1, severity: 1 });
phcAlertSchema.index({ alertType: 1, status: 1 });
phcAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PHCAlert', phcAlertSchema);
