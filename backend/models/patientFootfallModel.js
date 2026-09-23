const mongoose = require('mongoose');

const patientFootfallSchema = new mongoose.Schema({
  phcId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PHC', 
    required: true,
    index: true 
  },
  timestamp: { type: Date, default: Date.now, index: true },
  totalPatients: { type: Number, required: true, default: 0 },
  newPatients: { type: Number, default: 0 },
  emergencyPatients: { type: Number, default: 0 },
  outpatientPatients: { type: Number, default: 0 },
  admissions: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  averageWaitingTime: { type: Number, default: 25 }, // in minutes
  symptomCategories: {
    fever: { type: Number, default: 0 },
    cough_cold: { type: Number, default: 0 },
    diarrhea_vomiting: { type: Number, default: 0 },
    joint_pain: { type: Number, default: 0 },
    rash: { type: Number, default: 0 },
    breathing_difficulty: { type: Number, default: 0 },
    trauma: { type: Number, default: 0 },
    maternal_checkup: { type: Number, default: 0 }
  },
  diseaseCategories: {
    Respiratory: { type: Number, default: 0 },
    VectorBorne: { type: Number, default: 0 }, // Dengue, Malaria, Chikungunya
    Diarrheal: { type: Number, default: 0 },   // Gastroenteritis, Cholera
    Fever: { type: Number, default: 0 },
    Maternal: { type: Number, default: 0 },
    Chronic: { type: Number, default: 0 },     // Diabetes, Hypertension
    Injury: { type: Number, default: 0 },
    Other: { type: Number, default: 0 }
  },
  ageGroups: {
    pediatric: { type: Number, default: 0 }, // 0-14
    adult: { type: Number, default: 0 },     // 15-59
    geriatric: { type: Number, default: 0 }  // 60+
  }
}, {
  timestamps: true
});

patientFootfallSchema.index({ phcId: 1, timestamp: -1 });
patientFootfallSchema.index({ timestamp: -1 });

module.exports = mongoose.model('PatientFootfall', patientFootfallSchema);
