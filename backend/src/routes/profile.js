// src/routes/profile.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

// @route   POST api/profile/register
// @desc    Register a new user
// @access  Public
router.post('/register', profileController.register);

// @route   POST api/profile/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', profileController.login);

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authenticate, profileController.getProfile);

// @route   PATCH api/profile/me
// @desc    Update current user's profile
// @access  Private
router.patch('/me', authenticate, profileController.updateProfile);

// @route   POST api/profile/send-excerpt
// @desc    Find and send a book excerpt
// @access  Private
router.post('/send-excerpt', authenticate, profileController.sendBookExcerpt);

module.exports = router;