const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high'], default: 'low', index: true },
  resolved: { type: Boolean, default: false, index: true },
}, { 
  strict: false, 
  timestamps: true 
});

alertSchema.index({ user_id: 1, createdAt: -1 });
alertSchema.index({ user_id: 1, resolved: 1, severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
