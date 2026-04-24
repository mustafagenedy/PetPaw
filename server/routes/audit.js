const express = require('express');
const AuditLog = require('../models/AuditLog');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Admin: paginated audit log. Supports ?action=service.create and ?actor=<id>.
router.get('/', auth, admin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = {};
    if (req.query.action) filter.action = String(req.query.action);
    if (req.query.actor && /^[a-f0-9]{24}$/i.test(req.query.actor)) filter.actor = req.query.actor;
    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
