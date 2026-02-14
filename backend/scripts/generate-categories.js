const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const connectDB = require('../config/database');

const defaultCategories = [
  {
    name: 'Mathematics',
    description: 'Mathematics courses including algebra, geometry, calculus, and statistics'
  },
  {
    name: 'Science',
    description: 'Physics, Chemistry, Biology and other natural sciences'
  },
  {
    name: 'English',
    description: 'English language, literature, and communication skills'
  },
  {
    name: 'History',
    description: 'World history, national history, and historical studies'
  },
  {
    name: 'Social Studies',
    description: 'Geography, civics, economics, and social systems'
  },
  {
    name: 'Computer Science',
    description: 'Programming, web development, and IT fundamentals'
  },
  {
    name: 'Languages',
    description: 'Foreign language courses including Spanish, French, Hindi, Arabic'
  },
  {
    name: 'Arts',
    description: 'Visual arts, music, dance, and creative expression'
  },
  {
    name: 'Physical Education',
    description: 'Sports, fitness, and health education'
  },
  {
    name: 'Business Studies',
    description: 'Economics, accounting, management, and entrepreneurship'
  }
];

const generateCategories = async () => {
  try {
    await connectDB();

    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`✓ Categories already exist (${existingCount} categories). Skipping...`);
      process.exit(0);
    }

    console.log('⏳ Creating default categories...');

    const created = await Category.insertMany(defaultCategories);

    console.log('✓ Default categories created successfully');
    console.log(`  Total: ${created.length} categories`);
    created.forEach(cat => {
      console.log(`    - ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating categories:', error.message);
    process.exit(1);
  }
};

generateCategories();
