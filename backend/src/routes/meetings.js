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

// POST /api/meetings/quick-capture - Process a spoken summary (THIS IS THE NEW ROUTE)
router.post('/quick-capture', authenticate, meetingController.quickCaptureMeeting);

module.exports = router;