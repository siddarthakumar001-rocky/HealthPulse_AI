const mongoose = require('mongoose');

const redistributionSchema = new mongoose.Schema({
  sourcePHC: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  targetPHC: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  resourceName: { type: String, required: true, index: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'units' },
  urgencyLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical', 'Emergency'], 
    default: 'Medium',
    index: true 
  },
  distanceKm: { type: Number, required: true, default: 10 },
  surplusLevel: { type: Number, default: 0 },
  demandLevel: { type: Number, default: 0 },
  stockoutRisk: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High' },
  expiryRisk: { type: String, enum: ['None', 'Low', 'Moderate', 'Near-Expiry'], default: 'None' },
  transportAvailability: { type: String, enum: ['Immediate', 'Within 2 Hours', 'Same Day', 'Scheduled'], default: 'Within 2 Hours' },
  aiRecommendationScore: { type: Number, required: true, min: 0, max: 100, default: 85 },
  aiReasoning: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Recommended', 'Pending Approval', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Cancelled'], 
    default: 'Recommended',
    index: true 
  },
  approvedBy: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  dispatchedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' }
}, {
  timestamps: true
});

redistributionSchema.index({ sourcePHC: 1, targetPHC: 1, status: 1 });
redistributionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Redistribution', redistributionSchema);
