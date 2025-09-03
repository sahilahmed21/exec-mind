const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/demo/chat
// @desc    Get a scripted response for the interactive demo
// @access  Private
router.post('/chat', authenticate, demoController.getDemoResponse);

module.exports = router;