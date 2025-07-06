const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// User: Create booking
router.post('/', auth, async (req, res) => {
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
});

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
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all bookings
router.get('/', auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('service');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update booking status
router.put('/admin/:id', auth, admin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 