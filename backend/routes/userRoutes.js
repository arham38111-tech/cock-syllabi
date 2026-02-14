const express = require('express');
const router = express.Router();
const { setBankAccount, setPayoutRule, getMyBankAccount } = require('../controllers/userController');
const { verifyAuth } = require('../middleware/auth');

router.get('/me/bank-account', verifyAuth, getMyBankAccount);
router.post('/me/bank-account', verifyAuth, setBankAccount);
router.post('/me/payout-rule', verifyAuth, setPayoutRule);

module.exports = router;
