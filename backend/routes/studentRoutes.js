const express = require('express');
const {
  enrollCourse,
  getStudentCourses,
  getCourseProgress,
  markVideoWatched,
  generateSchedule,
  getSchedule,
  getStudentStats
} = require('../controllers/studentController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post('/enroll/:courseId', verifyAuth, verifyRole('student'), enrollCourse);
router.get('/my-courses', verifyAuth, verifyRole('student'), getStudentCourses);
router.get('/course/:courseId/progress', verifyAuth, verifyRole('student'), getCourseProgress);
router.patch('/course/:courseId/mark-watched', verifyAuth, verifyRole('student'), markVideoWatched);

// Schedule routes
router.post('/schedule/generate', verifyAuth, verifyRole('student'), generateSchedule);
router.get('/schedule', verifyAuth, verifyRole('student'), getSchedule);

// Stats
router.get('/stats', verifyAuth, verifyRole('student'), getStudentStats);

module.exports = router;
