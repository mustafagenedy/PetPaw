const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');

// Builds the Express app without any side effects (no DB connect, no listen).
// Tests call this directly; server.js wraps it with the boot sequence.
function createApp() {
  const app = express();

  // Behind a single proxy (Render, Vercel Functions, Fly.io, etc.) so that
  // req.ip and X-Forwarded-For are trusted. Matters for audit log IPs and
  // for express-rate-limit keying by real client address.
  app.set('trust proxy', 1);

  app.use(helmet());

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/', (req, res) => res.send('PetPaw API is running'));

  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/audit', auditRoutes);

  app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') console.error(err);
    else console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  });

  return app;
}

module.exports = { createApp };
