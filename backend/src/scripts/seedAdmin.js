/**
 * Run once to create initial admin user.
 * Usage: node src/scripts/seedAdmin.js
 * Ensure MONGODB_URI and JWT_SECRET are set (e.g. in .env).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-appointment';
    await mongoose.connect(uri);
    const exists = await User.findOne({ role: 'admin' });
    if (exists) {
      console.log('Admin already exists:', exists.email);
      process.exit(0);
      return;
    }
    await User.create({
      name: 'Admin',
      email: 'admin@clinic.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created: admin@clinic.com / admin123');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
