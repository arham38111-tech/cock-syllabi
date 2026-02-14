const express = require('express');
const {
  submitTeacherRequest,
  getTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  getMyTeacherRequest
} = require('../controllers/teacherController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Student and Guest routes
router.post('/request', verifyAuth, submitTeacherRequest);
router.get('/my-request', verifyAuth, getMyTeacherRequest);

// Admin routes
router.get('/requests', verifyAuth, verifyRole('admin'), getTeacherRequests);
router.patch('/requests/:requestId/approve', verifyAuth, verifyRole('admin'), approveTeacherRequest);
router.patch('/requests/:requestId/reject', verifyAuth, verifyRole('admin'), rejectTeacherRequest);

module.exports = router;
