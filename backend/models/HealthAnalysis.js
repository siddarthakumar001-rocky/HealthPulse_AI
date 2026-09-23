const mongoose = require('mongoose');

const healthAnalysisSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  condition: { type: String, required: true, default: 'Optimal Wellness' },
  healthScore: { type: Number, default: 85 }, // 0-100
  riskLevel: { type: String, default: 'Low' },
  dominantDosha: { type: String, default: 'Vata' },
  confidence: { type: Number, default: 0.92 },
  mlPrediction: {
    condition: String,
    confidence: Number,
    model: String
  },
  predictions: [{
    condition: String,
    confidence: Number,
    severity: String,
    reason: String
  }],
  reportedSymptoms: [{ type: String }],
  type: { type: String, enum: ['NORMAL', 'EMERGENCY'], default: 'NORMAL' },
  recommendations: {
    medicines: [{
      name: String,
      benefit: String,
      category: String
    }],
    lifestyle: [{ type: String }],
    diet: [{ type: String }],
    homeRemedies: [{ type: String }],
    precautions: [{ type: String }],
    doshaAdvice: String,
    dietAdvice: String,
    exerciseAdvice: String,
    disclaimer: String
  },
  hospitals: [{
    name: String,
    address: String,
    distance: String,
    contact: String
  }],
  alerts: [{
    type: { type: String },
    severity: String,
    message: String,
    priority: String
  }],
  criticalFlags: [{ type: String }],
  sensorData: {
    heartRate: Number,
    spo2: Number,
    temperature: Number
  },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false
});

// Index for faster lookups
healthAnalysisSchema.index({ user_id: 1, timestamp: -1 });

module.exports = mongoose.model('HealthAnalysis', healthAnalysisSchema);
