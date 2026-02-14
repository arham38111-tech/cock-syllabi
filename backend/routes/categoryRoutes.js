const express = require('express');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', verifyAuth, verifyRole('admin'), createCategory);
router.patch('/:id', verifyAuth, verifyRole('admin'), updateCategory);
router.delete('/:id', verifyAuth, verifyRole('admin'), deleteCategory);

module.exports = router;
