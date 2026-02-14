const express = require('express');
const { registerUser, loginUser, loginAdmin, getCurrentUser } = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/login-admin', loginAdmin);
router.get('/me', verifyAuth, getCurrentUser);

module.exports = router;
