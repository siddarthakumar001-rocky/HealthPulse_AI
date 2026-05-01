const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    console.error('[Security Error] JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ error: 'Internal server security error' });
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
