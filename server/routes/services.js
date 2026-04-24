const express = require('express');
const { body, param } = require('express-validator');
const Service = require('../models/Service');
const { auth, admin } = require('../middleware/auth');
const { csrfProtect } = require('../middleware/csrf');
const { validate } = require('../middleware/validate');
const { logAudit } = require('../middleware/audit');
const router = express.Router();

// `partial=true` makes every field optional (for PUT /:id partial updates)
const serviceValidators = (partial = false) => {
  const name = body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 chars');
  const price = body('price').isFloat({ min: 0, max: 10000 }).withMessage('Price must be 0–10000');
  const duration = body('duration').isInt({ min: 15, max: 600 }).withMessage('Duration must be 15–600 minutes');
  return [
    partial ? name.optional() : name,
    body('description').optional({ checkFalsy: true }).isString().trim().isLength({ max: 500 }).withMessage('Description too long'),
    partial ? price.optional() : price,
    partial ? duration.optional() : duration,
  ];
};

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
router.post(
  '/',
  auth,
  admin,
  csrfProtect,
  serviceValidators(false),
  validate,
  async (req, res) => {
    try {
      const { name, description, price, duration } = req.body;
      const service = await Service.create({ name, description, price, duration });
      logAudit(req, { action: 'service.create', target: { type: 'Service', id: service._id, label: service.name } });
      res.status(201).json(service);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update service (admin) — fields optional so partial updates are allowed
router.put(
  '/:id',
  auth,
  admin,
  csrfProtect,
  [
    param('id').isMongoId().withMessage('Invalid service id'),
    ...serviceValidators(true),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, description, price, duration } = req.body;
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        { name, description, price, duration },
        { new: true, omitUndefined: true }
      );
      if (!service) return res.status(404).json({ message: 'Service not found' });
      logAudit(req, { action: 'service.update', target: { type: 'Service', id: service._id, label: service.name } });
      res.json(service);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete service (admin)
router.delete(
  '/:id',
  auth,
  admin,
  csrfProtect,
  [param('id').isMongoId().withMessage('Invalid service id')],
  validate,
  async (req, res) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      logAudit(req, { action: 'service.delete', target: { type: 'Service', id: service._id, label: service.name } });
      res.json({ message: 'Service deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
