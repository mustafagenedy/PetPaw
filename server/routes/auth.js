const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { issueSession, clearSession } = require('../middleware/cookies');
const { validate } = require('../middleware/validate');
const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  // Tests hammer /register and /login — skip the limiter under NODE_ENV=test.
  skip: () => process.env.NODE_ENV === 'test',
});

const toClientUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('phone').optional({ checkFalsy: true }).isString().trim().isLength({ max: 30 }).withMessage('Phone too long'),
    body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const user = await User.create({ name, email, phone, password });
      const token = jwt.sign({ id: user._id, v: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' });
      issueSession(res, token);
      res.status(201).json({ user: toClientUser(user) });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, v: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' });
      issueSession(res, token);
      res.json({ user: toClientUser(user) });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Logout — clears cookies AND bumps tokenVersion so any leaked copy of the
// previous JWT becomes unusable. We call auth() here so we know *which*
// user to bump; if the cookie is already invalid, we still clear it.
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        await User.updateOne({ _id: decoded.id }, { $inc: { tokenVersion: 1 } });
      } catch { /* invalid/expired token — just clear cookies */ }
    }
  } finally {
    clearSession(res);
    res.json({ message: 'Logged out' });
  }
});

// Current user — how the client rehydrates auth state on page load
router.get('/me', auth, (req, res) => {
  res.json({ user: toClientUser(req.user) });
});

module.exports = router;
