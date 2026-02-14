const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/Course');
const User = require('../models/User');

const courses = [
  // Mathematics
  {
    title: 'Mathematics Fundamentals - Class 10',
    description: 'Master algebra, geometry, and trigonometry with step-by-step lessons and solved examples.',
    subject: 'Mathematics',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Algebra Basics', 'Geometry Introduction', 'Trigonometry Fundamentals', 'Equations & Solutions'],
    enrollmentCount: 0,
    isFree: true
  },
  // English
  {
    title: 'English Literature - Class 10',
    description: 'Explore Shakespeare, poetry, and prose. Enhance your reading and writing skills.',
    subject: 'English',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Grammar Essentials', 'Essay Writing', 'Literature Analysis', 'Reading Comprehension'],
    enrollmentCount: 0,
    isFree: true
  },
  // Science
  {
    title: 'Science Essentials - Class 10',
    description: 'Physics, Chemistry, and Biology fundamentals. Learn through interactive experiments.',
    subject: 'Science',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Physics Basics', 'Chemical Reactions', 'Biology & Life', 'Laboratory Methods'],
    enrollmentCount: 0,
    isFree: true
  },
  // History
  {
    title: 'World History - Class 9',
    description: 'Journey through ancient civilizations, medieval times, and modern era.',
    subject: 'History',
    classLevel: '9',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Ancient Civilizations', 'Medieval Period', 'Modern Era', 'Historical Figures'],
    enrollmentCount: 0,
    isFree: true
  },
  // Computer Science
  {
    title: 'Programming Basics - Class 10',
    description: 'Learn fundamental programming concepts using Python and JavaScript.',
    subject: 'Computer Science',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Programming Concepts', 'Python Basics', 'JavaScript Intro', 'Problem Solving'],
    enrollmentCount: 0,
    isFree: true
  },
  // Languages
  {
    title: 'Spanish Language Basics - Class 10',
    description: 'Learn conversational Spanish from scratch with pronunciation and practical examples.',
    subject: 'Languages',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Alphabet & Pronunciation', 'Basic Conversation', 'Grammar Rules', 'Culture & Practice'],
    enrollmentCount: 0,
    isFree: true
  },
  // Arts
  {
    title: 'Art Fundamentals - Class 9',
    description: 'Discover drawing, painting, and design principles with professional guidance.',
    subject: 'Arts',
    classLevel: '9',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Drawing Basics', 'Painting Techniques', 'Color Theory', 'Design Principles'],
    enrollmentCount: 0,
    isFree: true
  },
  // Physical Education
  {
    title: 'Sports & Fitness - Class 10',
    description: 'Learn sports rules, fitness training, and healthy lifestyle habits.',
    subject: 'Physical Education',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Sports Rules', 'Fitness Training', 'Nutrition', 'Sports Psychology'],
    enrollmentCount: 0,
    isFree: true
  },
  // Business Studies
  {
    title: 'Business Basics - Class 10',
    description: 'Introduction to business concepts, entrepreneurship, and economics.',
    subject: 'Business Studies',
    classLevel: '10',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Business Concepts', 'Entrepreneurship', 'Economics Basics', 'Marketing Fundamentals'],
    enrollmentCount: 0,
    isFree: true
  },
  // Social Studies
  {
    title: 'Social Studies - Class 9',
    description: 'Geography, civics, and social concepts integrated for holistic learning.',
    subject: 'Social Studies',
    classLevel: '9',
    price: 0,
    finalPrice: 0,
    teacherId: null,
    approved: true,
    videos: ['Geography Map Reading', 'Civic Duties', 'Society & Culture', 'Global Issues'],
    enrollmentCount: 0,
    isFree: true
  }
];

const initializeFreeCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB Connected');

    // Create a system admin user for free courses
    let systemUser = await User.findOne({ email: 'system@cockyllabi.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System',
        email: 'system@cockyllabi.com',
        password: 'system_password_123',
        role: 'teacher'
      });
      console.log('✓ System user created');
    }

    // Check if free courses already exist
    const existingCourses = await Course.countDocuments({ isFree: true });
    if (existingCourses > 0) {
      console.log(`⚠️  Free courses already exist (${existingCourses} found). Skipping creation.`);
      process.exit(0);
    }

    // Create courses with system user ID
    const coursesWithTeacher = courses.map(course => ({
      ...course,
      teacherId: systemUser._id
    }));

    const created = await Course.insertMany(coursesWithTeacher);
    console.log(`✓ Successfully created ${created.length} free courses`);
    
    console.log('\n📚 Free Courses Created:');
    created.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.title} (${course.subject})`);
    });

    console.log('\n✓ Free course initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating free courses:', error.message);
    process.exit(1);
  }
};

initializeFreeCourses();
