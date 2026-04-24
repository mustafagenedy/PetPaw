const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

(async function addAdmin() {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    console.error('ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 chars) in your env before running this script.');
    console.error('Example:');
    console.error('  ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD=a-strong-passphrase node addAdmin.js');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI (or MONGO_URI) is not set.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  await User.deleteOne({ email });
  await User.create({ name, email, password, role: 'admin' });
  console.log(`Admin user "${email}" created.`);
  process.exit(0);
})().catch(err => {
  console.error('Failed to create admin user:', err.message);
  process.exit(1);
});
