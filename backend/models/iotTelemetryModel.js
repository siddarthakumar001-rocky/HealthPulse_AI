const mongoose = require('mongoose');

const iotTelemetrySchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  phcId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  deviceType: { 
    type: String, 
    enum: ['ColdChain_Fridge', 'Smart_Medicine_Scale', 'RFID_Inventory_Gate', 'PHC_Footfall_Sensor', 'ESP32_Wearable', 'Equipment_Telemetry'],
    required: true 
  },
  sensorType: { 
    type: String, 
    enum: ['Medicine Weight', 'RFID', 'Temperature', 'Humidity', 'Equipment', 'ESP32 Vital Sensor', 'Motion/Footfall'],
    required: true,
    index: true 
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, index: true },
  batteryLevel: { type: Number, default: 100 },
  signalStrength: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Offline'], default: 'Good' },
  status: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Normal' }
}, {
  timestamps: true
});

iotTelemetrySchema.index({ deviceId: 1, timestamp: -1 });
iotTelemetrySchema.index({ phcId: 1, sensorType: 1, timestamp: -1 });

module.exports = mongoose.model('IoTTelemetry', iotTelemetrySchema);
