const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Bookings per month (last 12 months)
router.get('/bookings-per-month', auth, admin, async (req, res) => {
  try {
    const now = new Date();
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    const data = await Booking.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Total users
router.get('/total-users', auth, admin, async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Total bookings
router.get('/total-bookings', auth, admin, async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 