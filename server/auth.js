const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'heew-dev-secret-change-in-production';

function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const payload = verifyToken(header.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = payload;
  next();
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function employeeOnly(req, res, next) {
  if (req.user?.role !== 'employee') {
    return res.status(403).json({ error: 'Employee access required' });
  }
  next();
}

module.exports = {
  signToken,
  verifyToken,
  authMiddleware,
  adminOnly,
  employeeOnly,
  JWT_SECRET,
};
