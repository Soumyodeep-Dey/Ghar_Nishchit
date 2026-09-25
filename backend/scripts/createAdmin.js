import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/user.model.js';
import { resolveMongoConnectionString } from '../src/db/mongoUri.js';

const required = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_PHONE'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

try {
  const uri = await resolveMongoConnectionString(process.env.MONGODB_URI.trim());
  await mongoose.connect(uri, { dbName: 'gharNishchit' });
  const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  const admin = await User.findOneAndUpdate(
    { email },
    {
      name: process.env.ADMIN_NAME || 'Administrator',
      email,
      phone: process.env.ADMIN_PHONE.trim(),
      password,
      role: 'admin',
      status: 'active',
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).select('_id name email role status');
  console.log(`Admin account ready: ${admin.email}`);
} catch (error) {
  console.error('Failed to create admin account:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
