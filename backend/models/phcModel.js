const mongoose = require('mongoose');

const phcSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facilityCode: { type: String, required: true, unique: true, index: true },
  type: { 
    type: String, 
    enum: ['Sub-Centre', 'PHC', 'CHC', 'District Hospital'], 
    default: 'PHC' 
  },
  district: { type: String, required: true, index: true },
  state: { type: String, required: true, default: 'Maharashtra', index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  bedCapacity: { type: Number, required: true, default: 20 },
  occupiedBeds: { type: Number, required: true, default: 12 },
  availableBeds: { type: Number, required: true, default: 8 },
  staffCount: { type: Number, required: true, default: 15 },
  staffOnDuty: { type: Number, required: true, default: 10 },
  status: { 
    type: String, 
    enum: ['Optimal', 'Warning', 'Critical', 'Outbreak', 'Offline'], 
    default: 'Optimal',
    index: true
  },
  networkHealthScore: { type: Number, required: true, default: 85, index: true },
  subScores: {
    medicineAvailability: { type: Number, default: 85 },
    patientCapacity: { type: Number, default: 80 },
    equipmentAvailability: { type: Number, default: 90 },
    staffAvailability: { type: Number, default: 85 },
    coldChainStability: { type: Number, default: 95 },
    outbreakRiskScore: { type: Number, default: 20 }, // lower is safer
  },
  connectivity: {
    isOnline: { type: Boolean, default: true, index: true },
    lastSync: { type: Date, default: Date.now },
    pendingSyncRecords: { type: Number, default: 0 }
  },
  contactNumber: { type: String, default: '+91 98765 43210' },
  chiefMedicalOfficer: { type: String, default: 'Dr. A. Sharma' },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

phcSchema.index({ facilityCode: 1 }, { unique: true });
phcSchema.index({ district: 1, state: 1 });
phcSchema.index({ networkHealthScore: 1 });
phcSchema.index({ 'connectivity.isOnline': 1 });
phcSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('PHC', phcSchema);
