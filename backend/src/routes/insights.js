// backend/src/routes/insights.js

const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const { authenticate } = require('../middleware/auth');

// @route   GET api/insights
// @desc    Get all insights for the current user
// @access  Private
router.get('/', authenticate, insightController.getInsights);

// @route   POST api/insights/generate
// @desc    Generate and save new weekly insights for the user
// @access  Private
router.post('/generate', authenticate, insightController.generateInsights);

module.exports = router;