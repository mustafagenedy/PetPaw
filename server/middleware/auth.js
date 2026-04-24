const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    // tokenVersion check: any logout or forced-revoke bumps the user's counter,
    // which invalidates all previously-signed JWTs even if the cookie is replayed.
    if (typeof decoded.v !== 'number' || decoded.v !== user.tokenVersion) {
      return res.status(401).json({ message: 'Session invalid' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session invalid' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { auth, admin };
