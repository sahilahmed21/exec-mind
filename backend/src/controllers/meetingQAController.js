const aiService = require('../services/aiService');
const { retrieveMeetingSummary, getArchivedMeetings } = require('../utils/meetingHistory');

// Answer a question about a meeting
exports.ask = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'A query is required.' });
        }

        const meetingContext = retrieveMeetingSummary(query);
        if (!meetingContext) {
            return res.status(404).json({ answer: "I couldn't find a meeting matching that description in the archive." });
        }

        const result = await aiService.answerMeetingQuestion({ question: query, context: meetingContext.summary });
        res.status(200).json(result);

    } catch (error) {
        console.error('Meeting Q&A error:', error);
        res.status(500).json({ error: 'Failed to answer the question.' });
    }
};

// Get the list of all archived meetings
exports.getArchive = (req, res) => {
    try {
        const meetings = getArchivedMeetings();
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve meeting archive.' });
    }
}