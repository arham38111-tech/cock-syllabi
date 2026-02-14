const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', verifyAuth, verifyRole('admin'), createProduct);
router.put('/:id', verifyAuth, verifyRole('admin'), updateProduct);
router.delete('/:id', verifyAuth, verifyRole('admin'), deleteProduct);

module.exports = router;
