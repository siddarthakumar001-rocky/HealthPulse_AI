/**
 * HealthPulse AI - Subscription Entitlements Model
 * Tracks active subscription tiers and unlocked features.
 */

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['Free', 'PHC_Care_Pro', 'District_Command_Enterprise', 'Ayurvedic_Wellness_Plus'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  lastPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  features: {
    aiConsultationsLimit: { type: Number, default: 50 },
    continuousIoTTags: { type: Number, default: 2 },
    epidemicForecasting: { type: Boolean, default: true },
    automatedSupplyRedistribution: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
