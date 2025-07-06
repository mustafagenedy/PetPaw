const express = require('express');
const GalleryImage = require('../models/GalleryImage');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Get all images
router.get('/', async (req, res) => {
  try {
    const images = await GalleryImage.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add image (admin)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { url, caption } = req.body;
    const image = await GalleryImage.create({ url, caption });
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete image (admin)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 