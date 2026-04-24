const express = require('express');
const { body, param } = require('express-validator');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth, admin } = require('../middleware/auth');
const { csrfProtect } = require('../middleware/csrf');
const { validate } = require('../middleware/validate');
const { logAudit } = require('../middleware/audit');
const router = express.Router();

const ADMIN_BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

// User: Create booking
router.post(
  '/',
  auth,
  csrfProtect,
  [
    body('serviceId').isMongoId().withMessage('Invalid service'),
    body('date').isISO8601().withMessage('Invalid date'),
  ],
  validate,
  async (req, res) => {
    try {
      const { serviceId, date } = req.body;
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      const booking = await Booking.create({
        user: req.user._id,
        service: serviceId,
        date,
        status: 'pending',
      });
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// User: Get own bookings
router.get('/me', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('service');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Update/cancel own booking
router.put(
  '/:id',
  auth,
  csrfProtect,
  [
    param('id').isMongoId().withMessage('Invalid booking id'),
    body('date').optional().isISO8601().withMessage('Invalid date'),
  ],
  validate,
  async (req, res) => {
    try {
      const { date } = req.body;
      const booking = await Booking.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { date },
        { new: true, omitUndefined: true }
      );
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// User: Cancel booking
router.delete(
  '/:id',
  auth,
  csrfProtect,
  [param('id').isMongoId().withMessage('Invalid booking id')],
  validate,
  async (req, res) => {
    try {
      const booking = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.json({ message: 'Booking cancelled' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin: Get all bookings (paginated, filterable by status)
router.get('/', auth, admin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const filter = {};
    if (req.query.status && ADMIN_BOOKING_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email phone')
        .populate('service')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update booking status
router.put(
  '/admin/:id',
  auth,
  admin,
  csrfProtect,
  [
    param('id').isMongoId().withMessage('Invalid booking id'),
    body('status').isIn(ADMIN_BOOKING_STATUSES).withMessage('Invalid status'),
  ],
  validate,
  async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      logAudit(req, {
        action: `booking.${status}`,
        target: { type: 'Booking', id: booking._id },
        meta: { status },
      });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
