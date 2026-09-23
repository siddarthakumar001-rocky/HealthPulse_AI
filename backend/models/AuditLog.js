/**
 * HealthPulse AI - Security & Operational Audit Log Model
 * Append-only record of security-critical actions and transactions.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or 'SYSTEM' / 'ESP32_DEVICE'
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_SIGNUP',
      'USER_LOGIN',
      'ADMIN_LOGIN',
      'LOGIN_FAILED',
      'PASSWORD_CHANGED',
      'USER_ROLE_UPDATED',
      'USER_DELETED',
      'ALERT_RESOLVED',
      'RESOURCE_TRANSFER_CREATED',
      'RESOURCE_TRANSFER_APPROVED',
      'PAYMENT_ORDER_CREATED',
      'PAYMENT_VERIFIED',
      'PAYMENT_WEBHOOK_RECEIVED',
      'IOT_DEVICE_REGISTERED',
      'EMERGENCY_SIMULATION_TRIGGERED'
    ],
    index: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING'],
    default: 'SUCCESS'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  requestId: {
    type: String,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Append only
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
