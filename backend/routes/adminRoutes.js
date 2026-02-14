const express = require('express');
const {
  getAllUsers,
  getTeachers,
  getDashboardStats,
  getTeacherPoolStatus,
  getCourseAnalytics
} = require('../controllers/adminController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.get('/users', verifyAuth, verifyRole('admin'), getAllUsers);
router.get('/teachers', verifyAuth, verifyRole('admin'), getTeachers);
router.get('/stats', verifyAuth, verifyRole('admin'), getDashboardStats);
router.get('/pool-status', verifyAuth, verifyRole('admin'), getTeacherPoolStatus);
router.get('/analytics', verifyAuth, verifyRole('admin'), getCourseAnalytics);

module.exports = router;
