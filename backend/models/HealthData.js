const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  deviceId: {
    type: String,
    required: false // Optional for manual entries, though usually provided by IoT
  },
  heartRate: { 
    type: Number, 
    required: true 
  },
  spo2: { 
    type: Number, 
    required: true 
  },
  temperature: { 
    type: Number, 
    required: true 
  },
  // Data Provenance & Diffusion Tracking
  source: {
    type: String,
    enum: ['sensor', 'CSDI_reconstructed'],
    default: 'sensor'
  },
  imputationConfidence: {
    type: Number,
    default: 1.0 // 1.0 for true sensor, estimated confidence for CSDI
  },
  activity: {
    type: String,
    enum: ['resting', 'walking', 'running', 'sleeping', 'exercise', 'unknown'],
    default: 'resting'
  },
  signalQuality: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Index for faster querying by user and latest first
healthDataSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('HealthData', healthDataSchema);
