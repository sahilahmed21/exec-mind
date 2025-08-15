// src/routes/meetings.js

const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate } = require('../middleware/auth');

// @route   POST api/meetings/summarize
// @desc    Create a meeting summary from notes
// @access  Private
router.post('/summarize', authenticate, meetingController.createMeetingSummary);

// @route   GET api/meetings/prep/:participantName
// @desc    Get pre-meeting briefing for a participant
// @access  Private
router.get('/prep/:participantName', authenticate, meetingController.getMeetingPrep);

// @route   GET api/meetings
// @desc    Get all meetings for the user
// @access  Private
router.get('/', authenticate, meetingController.getMeetings);

module.exports = router;