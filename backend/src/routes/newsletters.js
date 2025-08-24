// backend/src/routes/newsletters.js

const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { authenticate } = require('../middleware/auth');

// @route   GET api/newsletters
// @desc    Get all newsletters
// @access  Private
router.get('/', authenticate, newsletterController.getNewsletters);

// @route   GET api/newsletters/:id
// @desc    Get a single newsletter by its ID
// @access  Private
router.get('/:id', authenticate, newsletterController.getNewsletterById);

// @route   POST api/newsletters/generate
// @desc    Generate a new newsletter draft
// @access  Private
router.post('/generate', authenticate, newsletterController.generateNewsletter);

module.exports = router;
