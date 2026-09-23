const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  phcId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  medicineName: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: ['Antibiotics', 'Vaccines', 'Maternal Health', 'Emergency', 'IV Fluids', 'Chronic Care', 'Analgesics', 'Antipyretics', 'Other'],
    default: 'Essential',
    index: true 
  },
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'vials' }, // vials, tablets, bottles, ampoules, strips
  safeBufferThreshold: { type: Number, required: true, default: 100 },
  dailyBurnRate: { type: Number, required: true, default: 10 },
  expiryDate: { type: Date, required: true, index: true },
  coldChainRequired: { type: Boolean, default: false, index: true },
  storageTemperature: { type: Number, default: 22 }, // in Celsius
  minTemperature: { type: Number, default: 2 },
  maxTemperature: { type: Number, default: 8 },
  iotTagId: { type: String, default: '', index: true },
  stockHealth: { 
    type: String, 
    enum: ['Normal', 'Low', 'Critical', 'Expired', 'Excess'], 
    default: 'Normal',
    index: true 
  },
  estimatedDepletionDate: { type: String }, // e.g. "27 Aug 2026 ± 2 days"
  confidenceScore: { type: Number, default: 90 }, // e.g. 91%
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

inventorySchema.index({ phcId: 1, medicineName: 1 });
inventorySchema.index({ phcId: 1, stockHealth: 1 });
inventorySchema.index({ coldChainRequired: 1, storageTemperature: 1 });
inventorySchema.index({ expiryDate: 1, stockHealth: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
