const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

// @route   GET api/search
// @desc    Search across all user data
// @access  Private
router.get('/', authenticate, searchController.searchAll);

module.exports = router;