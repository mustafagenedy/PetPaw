const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');
dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Service.deleteMany();

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@petpaw.com',
    password: 'admin123',
    role: 'admin',
  });

  const services = [
    { name: 'Bath & Brush', description: 'Gentle bath, blow dry, and brushing.', price: 30, duration: 45 },
    { name: 'Full Groom', description: 'Haircut, nail trim, ear cleaning.', price: 60, duration: 90 },
    { name: 'Nail Trimming', description: 'Quick and safe nail trimming.', price: 15, duration: 15 },
  ];
  await Service.insertMany(services);

  console.log('Seeded admin and services!');
  process.exit();
};

seed(); 