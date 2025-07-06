const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User'); // Adjust path as needed

async function addAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/petpaw');
  await User.deleteOne({ email: 'admin@petpaw.com' }); // Optional: remove old admin
  await User.create({
    name: 'Admin',
    email: 'admin@petpaw.com',
    password: 'admin123', // plain text, will be hashed by pre('save')
    role: 'admin'
  });
  console.log('Admin user created!');
  process.exit();
}

addAdmin();
