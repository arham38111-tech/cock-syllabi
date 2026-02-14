const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.get('/', policyController.getAllPolicies);
router.get('/:type', policyController.getPolicyByType);

// Admin protected routes
router.put('/:type', authenticateUser, policyController.updatePolicy);
router.post('/init/default', policyController.initializeDefaultPolicies);

module.exports = router;
