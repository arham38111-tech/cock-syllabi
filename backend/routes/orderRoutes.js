const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getUserOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyAuth, verifyRole } = require('../middleware/auth');

router.post('/', verifyAuth, createOrder);
router.get('/', verifyAuth, verifyRole('admin'), getOrders);
router.get('/user/:userId', verifyAuth, getUserOrders);
router.patch('/:id/status', verifyAuth, verifyRole('admin'), updateOrderStatus);

module.exports = router;
