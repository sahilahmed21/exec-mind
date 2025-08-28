const express = require('express');
const router = express.Router();
const analystController = require('../controllers/analystController');
const { authenticate } = require('../middleware/auth');

// @route   POST api/analyst/query
// @desc    Analyze a document based on a query
// @access  Private
router.post('/query', authenticate, analystController.analyze);

module.exports = router;