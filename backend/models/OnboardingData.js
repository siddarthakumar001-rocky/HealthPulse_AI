const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
}, { 
  strict: false, 
  timestamps: true 
});

onboardingSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('OnboardingData', onboardingSchema);
