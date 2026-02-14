const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const connectDB = require('../config/database');

const setupAdmin = async () => {
  try {
    await connectDB();

    const adminUsername = (process.env.ADMIN_USERNAME || '').trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('✗ Admin credentials not set in environment variables');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('✓ Admin already exists. Skipping...');
      process.exit(0);
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(adminPassword, salt);

    // Create admin
    const admin = new User({
      name: 'Administrator',
      email: 'admin@cock-syllabi.local',
      password: hashedPassword,
      role: 'admin',
      isApproved: true
    });

    await admin.save();

    console.log('✓ Admin user created successfully');
    console.log(`  Username: ${adminUsername}`);
    console.log('  Role: Admin');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting up admin:', error.message);
    process.exit(1);
  }
};

setupAdmin();
