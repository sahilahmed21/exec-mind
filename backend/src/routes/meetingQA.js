const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate } = require('../middleware/auth');

// GET /api/meetings - Get all saved meetings
router.get('/', authenticate, meetingController.getMeetings);

// POST /api/meetings/summarize - Create a new meeting summary
router.post('/summarize', authenticate, meetingController.createMeetingSummary);

// POST /api/meetings/ask - Ask a question about saved meetings
router.post('/ask', authenticate, meetingController.askAboutMeeting);

module.exports = router;