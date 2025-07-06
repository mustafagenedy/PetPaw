const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Get all messages (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const contact = await ContactMessage.create({ name, email, message });
    console.log('Contact form submitted:', contact);
    res.status(201).json({ message: 'Message received' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Respond to a message
router.put('/:id/response', auth, admin, async (req, res) => {
  try {
    const { response } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { response, respondedAt: new Date() },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

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