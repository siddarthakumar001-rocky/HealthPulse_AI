const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  phcId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  equipmentId: { type: String, required: true, index: true },
  equipmentName: { type: String, required: true },
  equipmentType: { 
    type: String, 
    enum: ['Oxygen Concentrator', 'Ventilator', 'ECG Machine', 'Vaccine Refrigerator', 'Autoclave', 'X-Ray Unit', 'Ambulance', 'Defibrillator', 'CBC Analyzer', 'Solar Power Inverter'],
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['Operational', 'Warning', 'Maintenance', 'Failed', 'Offline'], 
    default: 'Operational',
    index: true 
  },
  usageHours: { type: Number, default: 0 },
  lastMaintenance: { type: Date, default: Date.now },
  nextMaintenance: { type: Date },
  failureRisk: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Low',
    index: true 
  },
  iotConnected: { type: Boolean, default: true },
  lastTelemetry: {
    batteryPercentage: { type: Number, default: 95 },
    operatingTemp: { type: Number, default: 35 },
    loadPercentage: { type: Number, default: 60 },
    errorCodes: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

equipmentSchema.index({ phcId: 1, equipmentId: 1 });
equipmentSchema.index({ phcId: 1, status: 1 });
equipmentSchema.index({ failureRisk: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
