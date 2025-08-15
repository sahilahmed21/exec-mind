// src/routes/ideas.js

const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { authenticate } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// @route   POST api/ideas
// @desc    Create a new idea from text
// @access  Private
router.post('/', authenticate, ideaController.createIdea);

// @route   POST api/ideas/voice
// @desc    Create a new idea from a voice recording
// @access  Private
router.post('/voice', authenticate, uploadSingle('audio'), ideaController.createIdea);

// @route   GET api/ideas
// @desc    Get all ideas for the user
// @access  Private
router.get('/', authenticate, ideaController.getIdeas);

module.exports = router;