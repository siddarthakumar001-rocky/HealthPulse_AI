const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || "healthpulse_fallback_secret_2026_secure_default";

  // Prefer standard Authorization Bearer header
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && req.method === 'GET' && req.path.includes('/download')) {
    // Only permit query tokens on dedicated GET download streaming endpoints
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
