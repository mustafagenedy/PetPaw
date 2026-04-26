const path = require('path');
const dotenv = require('dotenv');

// Load .env sitting next to this file, regardless of how the process is launched
dotenv.config({ path: path.join(__dirname, '.env') });

// Sentry must initialize before express + mongoose so it can auto-instrument.
// instrument.js is a no-op when SENTRY_DSN is unset.
require('./instrument');

const connectDB = require('./config/db');
const { createApp } = require('./app');

// Fail fast if critical secrets are missing, too short, or still the placeholder
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET || JWT_SECRET.length < 32 || /your_super_secret|replace_me/i.test(JWT_SECRET)) {
  console.error('FATAL: JWT_SECRET is missing, shorter than 32 chars, or still the placeholder.');
  console.error('Generate one with: openssl rand -base64 32');
  process.exit(1);
}

connectDB();
const app = createApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
