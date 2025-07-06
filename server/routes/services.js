const express = require('express');
const Service = require('../models/Service');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service (admin)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    const service = await Service.create({ name, description, price, duration });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service (admin)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service (admin)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 