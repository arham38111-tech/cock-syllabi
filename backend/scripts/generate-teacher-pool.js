const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const TeacherAccountsPool = require('../models/TeacherAccountsPool');
const connectDB = require('../config/database');

const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const generateTeacherPool = async () => {
  try {
    await connectDB();

    const existingCount = await TeacherAccountsPool.countDocuments();
    if (existingCount > 0) {
      console.log(`✓ Teacher accounts pool already exists (${existingCount} accounts). Skipping generation...`);
      process.exit(0);
    }

    console.log('⏳ Generating 1000 teacher accounts...');

    const accounts = [];
    const salt = await bcryptjs.genSalt(10);

    for (let i = 1; i <= 1000; i++) {
      const username = `TEACH${String(i).padStart(4, '0')}`;
      const password = generateRandomPassword();
      const hashedPassword = await bcryptjs.hash(password, salt);

      accounts.push({
        username,
        password: hashedPassword,
        allocated: false
      });

      if (i % 100 === 0) {
        console.log(`  Generated ${i}/1000...`);
      }
    }

    await TeacherAccountsPool.insertMany(accounts);

    console.log('✓ Teacher account pool generated successfully');
    console.log('  Total accounts: 1000');
    console.log('  Available: 1000');
    console.log('  Username format: TEACH0001 - TEACH1000');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error generating teacher pool:', error.message);
    process.exit(1);
  }
};

generateTeacherPool();
