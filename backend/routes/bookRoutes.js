const express = require('express');
const router = express.Router();
const { verifyAuth, verifyRole } = require('../middleware/auth');
const {
  addBook,
  getCourseBooks,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  purchaseBook,
  getTeacherBooks
} = require('../controllers/bookController');

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/course/:courseId', getCourseBooks);

// Protected routes (Teacher)
router.post('/', verifyAuth, verifyRole('teacher'), addBook);
router.patch('/:id', verifyAuth, verifyRole('teacher'), updateBook);
router.delete('/:id', verifyAuth, verifyRole('teacher'), deleteBook);
router.get('/teacher/my-books', verifyAuth, verifyRole('teacher'), getTeacherBooks);

// Student routes
router.post('/:id/purchase', verifyAuth, verifyRole('student'), purchaseBook);

module.exports = router;
