const mongoose = require('mongoose');

const humanDigitalTwinSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true 
  },
  
  // Real-Time Personalized Physiological State
  currentState: {
    heartRate: { type: Number, default: 72 },
    spo2: { type: Number, default: 98 },
    temperature: { type: Number, default: 36.6 },
    activity: { 
      type: String, 
      enum: ['resting', 'walking', 'running', 'sleeping', 'exercise', 'unknown'],
      default: 'resting' 
    },
    signalQuality: { type: Number, default: 100 },
    stressIndex: { type: Number, default: 15 },
    healthStatus: { type: String, default: 'Optimal' },
    doshaProfile: { type: String, default: 'Vata-Pitta' },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Longitudinal & Diffusion Quality Metrics
  dataQuality: {
    totalPoints: { type: Number, default: 100 },
    sensorMeasuredPoints: { type: Number, default: 94 },
    csdiImputedPoints: { type: Number, default: 6 },
    reliabilityPercentage: { type: Number, default: 94.0 }, // Sensor vs CSDI ratio
    meanAbsoluteImputationError: { type: Number, default: 1.8 } // MAE in BPM
  },

  // Context-Aware False Alert Tracking
  alertStats: {
    totalTriggers: { type: Number, default: 0 },
    suppressedFalseAlerts: { type: Number, default: 0 },
    activeWarnings: { type: Number, default: 0 }
  },

  // Future Forecasting Window (TimeGrad or Autoregressive Extension)
  forecastWindow: [{
    timestamp: { type: Date },
    predictedHeartRate: { type: Number },
    predictedSpO2: { type: Number },
    predictedTemperature: { type: Number },
    model: { type: String, default: 'TimeGrad' },
    confidence: { type: Number, default: 0.92 }
  }],

  // Historical Twin Snapshots
  history: [{
    timestamp: { type: Date, default: Date.now },
    heartRate: Number,
    spo2: Number,
    temperature: Number,
    activity: String,
    source: { type: String, enum: ['sensor', 'CSDI'], default: 'sensor' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('HumanDigitalTwin', humanDigitalTwinSchema);
