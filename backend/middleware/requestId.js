/**
 * HealthPulse AI - Request ID & Tracing Middleware
 * Generates or propagates a unique Request ID across the call stack.
 */

const crypto = require('crypto');

const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId = incomingId || `hp_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

module.exports = requestIdMiddleware;
