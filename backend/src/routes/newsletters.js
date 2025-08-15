// src/routes/newsletters.js

const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { authenticate } = require('../middleware/auth');

// @route   POST api/newsletters/generate
// @desc    Generate a new newsletter draft
// @access  Private
router.post('/generate', authenticate, newsletterController.generateNewsletter);

// @route   GET api/newsletters
// @desc    Get all newsletters
// @access  Private
router.get('/', authenticate, newsletterController.getNewsletters);

module.exports = router;