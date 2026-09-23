/**
 * HealthPulse AI - Payment Transaction Model
 * Stores only safe payment provider tokens, order IDs, and statuses.
 * NEVER STORES CARD NUMBERS, CVVs, PINs, OR RAW BANKING DATA.
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  idempotencyKey: {
    type: String,
    index: true
  },
  provider: {
    type: String,
    enum: ['razorpay', 'stripe', 'mock_gateway'],
    default: 'razorpay'
  },
  providerOrderId: {
    type: String,
    index: true
  },
  providerPaymentId: {
    type: String,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  plan: {
    type: String,
    enum: ['Free', 'PHC_Care_Pro', 'District_Command_Enterprise', 'Ayurvedic_Wellness_Plus'],
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
