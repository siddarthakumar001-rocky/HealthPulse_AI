/**
 * HealthPulse AI - Security & Injection Protection Middleware
 * Protects against NoSQL injection, parameter pollution, and malicious operators.
 */

function sanitizeObject(target) {
  if (!target || typeof target !== 'object') return target;

  if (Array.isArray(target)) {
    return target.map(item => sanitizeObject(item));
  }

  const clean = {};
  for (const key of Object.keys(target)) {
    // Block keys containing MongoDB query operators like $gt, $ne, $where, $regex, etc.
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    const value = target[key];
    if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      // Strip dangerous control null-bytes
      clean[key] = value.replace(/\0/g, '');
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const noSqlSanitizer = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = {
  noSqlSanitizer,
  sanitizeObject
};
