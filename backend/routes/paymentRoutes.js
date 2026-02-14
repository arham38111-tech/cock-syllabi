const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { verifyAuth } = require('../middleware/auth');

router.post('/create-payment-intent', verifyAuth, createPaymentIntent);

module.exports = router;
