const express = require('express');
const { body, param } = require('express-validator');
const GalleryImage = require('../models/GalleryImage');
const { auth, admin } = require('../middleware/auth');
const { csrfProtect } = require('../middleware/csrf');
const { validate } = require('../middleware/validate');
const { logAudit } = require('../middleware/audit');
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
router.post(
  '/',
  auth,
  admin,
  csrfProtect,
  [
    body('url').isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Must be an http(s) URL'),
    body('caption').optional({ checkFalsy: true }).isString().trim().isLength({ max: 200 }).withMessage('Caption too long'),
  ],
  validate,
  async (req, res) => {
    try {
      const { url, caption } = req.body;
      const image = await GalleryImage.create({ url, caption });
      logAudit(req, { action: 'gallery.create', target: { type: 'GalleryImage', id: image._id, label: caption || url } });
      res.status(201).json(image);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete image (admin)
router.delete(
  '/:id',
  auth,
  admin,
  csrfProtect,
  [param('id').isMongoId().withMessage('Invalid image id')],
  validate,
  async (req, res) => {
    try {
      const image = await GalleryImage.findByIdAndDelete(req.params.id);
      if (!image) return res.status(404).json({ message: 'Image not found' });
      logAudit(req, { action: 'gallery.delete', target: { type: 'GalleryImage', id: image._id, label: image.caption || image.url } });
      res.json({ message: 'Image deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
