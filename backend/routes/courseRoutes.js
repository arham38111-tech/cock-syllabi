const express = require('express');
const {
  createCourse,
  getAllCourses,
  getPendingCourses,
  getTeacherCourses,
  getCourseById,
  updateCourse,
  approveCourse,
  rejectCourse,
  deleteCourse
} = require('../controllers/courseController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:courseId', getCourseById);

// Teacher routes
router.post('/', verifyAuth, verifyRole('teacher'), createCourse);
router.get('/teacher/my-courses', verifyAuth, verifyRole('teacher'), getTeacherCourses);
router.patch('/:courseId', verifyAuth, verifyRole('teacher'), updateCourse);
router.delete('/:courseId', verifyAuth, verifyRole('teacher'), deleteCourse);

// Admin routes
router.get('/admin/pending-courses', verifyAuth, verifyRole('admin'), getPendingCourses);
router.patch('/:courseId/approve', verifyAuth, verifyRole('admin'), approveCourse);
router.patch('/:courseId/reject', verifyAuth, verifyRole('admin'), rejectCourse);

module.exports = router;
