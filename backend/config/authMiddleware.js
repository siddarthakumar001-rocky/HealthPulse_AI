const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    const errorMsg = 'JWT_SECRET is missing in environment variables';
    console.error(`[Security Error] ${errorMsg}`);
    return res.status(500).json({ error: errorMsg });
  }

  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
