/**
 * HealthPulse AI - Structured Logger Utility
 * Provides production-ready structured logging with automatic redaction of sensitive data
 * (passwords, tokens, OTPs, secret keys, credit card numbers).
 */

const SENSITIVE_KEYS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'secret',
  'jwt_secret',
  'payment_secret',
  'apikey',
  'x-api-key',
  'cardnumber',
  'cvv',
  'pin',
  'otp'
];

function redactSensitiveData(obj, depth = 0) {
  if (!obj || depth > 4) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = redactSensitiveData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, Object.keys(meta).length > 0 ? JSON.stringify(redactSensitiveData(meta)) : '');
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, Object.keys(meta).length > 0 ? JSON.stringify(redactSensitiveData(meta)) : '');
  },

  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, Object.keys(meta).length > 0 ? JSON.stringify(redactSensitiveData(meta)) : '');
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [DEBUG] ${message}`, Object.keys(meta).length > 0 ? JSON.stringify(redactSensitiveData(meta)) : '');
    }
  },

  redactSensitiveData
};

module.exports = logger;
