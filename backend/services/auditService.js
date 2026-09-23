/**
 * HealthPulse AI - Audit Logging Service
 * Records security-sensitive operations with automatic redaction.
 */

const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const logAudit = async ({
  userId,
  action,
  status = 'SUCCESS',
  req = null,
  details = {}
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : 'INTERNAL';
    const userAgent = req ? req.headers['user-agent'] : 'INTERNAL';
    const requestId = req?.id || `req_${Date.now()}`;

    const cleanDetails = logger.redactSensitiveData(details);

    const logEntry = new AuditLog({
      userId: userId || 'ANONYMOUS',
      action,
      status,
      ipAddress,
      userAgent,
      requestId,
      details: cleanDetails
    });

    await logEntry.save();
    logger.info(`[Audit] Action: ${action} | Status: ${status} | User: ${userId}`);
  } catch (err) {
    logger.error('[Audit] Failed to persist audit log:', { error: err.message });
  }
};

module.exports = {
  logAudit
};
