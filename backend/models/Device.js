const mongoose = require('mongoose');

const deviceRegistrySchema = new mongoose.Schema({
  deviceId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  status: { 
    type: String, 
    default: 'offline',
    index: true 
  },
  lastSeen: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
}, { 
  timestamps: true 
});

deviceRegistrySchema.index({ deviceId: 1 }, { unique: true });
deviceRegistrySchema.index({ status: 1, lastSeen: -1 });

module.exports = mongoose.model('Device', deviceRegistrySchema);
