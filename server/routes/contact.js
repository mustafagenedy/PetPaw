const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
const { auth, admin } = require('../middleware/auth');
const { csrfProtect } = require('../middleware/csrf');
const { validate } = require('../middleware/validate');
const { logAudit } = require('../middleware/audit');
const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages. Please try again later.' },
  skip: () => process.env.NODE_ENV === 'test',
});

// Get all messages (admin only — paginated)
router.get('/', auth, admin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const filter = {};
    if (req.query.responded === 'true') filter.response = { $ne: null, $exists: true };
    if (req.query.responded === 'false') filter.$or = [{ response: null }, { response: { $exists: false } }];
    const [items, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContactMessage.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (admin only)
router.delete(
  '/:id',
  auth,
  admin,
  csrfProtect,
  [param('id').isMongoId().withMessage('Invalid message id')],
  validate,
  async (req, res) => {
    try {
      const msg = await ContactMessage.findByIdAndDelete(req.params.id);
      if (!msg) return res.status(404).json({ message: 'Message not found' });
      logAudit(req, { action: 'contact.delete', target: { type: 'ContactMessage', id: msg._id, label: msg.email } });
      res.json({ message: 'Message deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Contact form submission (public)
router.post(
  '/',
  contactLimiter,
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 chars'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('message').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1–2000 chars'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, message } = req.body;
      await ContactMessage.create({ name, email, message });
      res.status(201).json({ message: 'Message received' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin: Respond to a message
router.put(
  '/:id/response',
  auth,
  admin,
  csrfProtect,
  [
    param('id').isMongoId().withMessage('Invalid message id'),
    body('response').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('Response must be 1–2000 chars'),
  ],
  validate,
  async (req, res) => {
    try {
      const { response } = req.body;
      const msg = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { response, respondedAt: new Date() },
        { new: true }
      );
      if (!msg) return res.status(404).json({ message: 'Message not found' });
      logAudit(req, { action: 'contact.respond', target: { type: 'ContactMessage', id: msg._id, label: msg.email } });
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// User: Get their own messages by email (auth required)
router.get('/user', auth, async (req, res) => {
  try {
    const email = req.user.email;
    const messages = await ContactMessage.find({ email }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
