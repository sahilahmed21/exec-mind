const Meeting = require('../models/Meeting');
const aiService = require('../services/aiService');
const calendarService = require('../services/calendarService');
const { MEETING_QA_PROMPT } = require('../utils/aiPrompts'); // Import the QA Prompt

// (Restored) Process meeting notes and save to DB
exports.createMeetingSummary = async (req, res) => {
    try {
        const { title, participants, date, meetingNotes } = req.body;
        const aiAnalysis = await aiService.summarizeAndExtract(meetingNotes);

        const newMeeting = new Meeting({
            title,
            participants,
            date,
            userId: req.user._id,
            summary: aiAnalysis.summary,
            keyPoints: aiAnalysis.keyPoints,
            actionItems: aiAnalysis.actionItems,
            followUpNeeded: aiAnalysis.followUpNeeded
        });
        await newMeeting.save();

        if (aiAnalysis.followUpNeeded) {
            await calendarService.scheduleFollowUp(newMeeting, req.user);
        }
        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('Error creating meeting summary:', error);
        res.status(500).json({ error: 'Failed to create meeting summary' });
    }
};

// (Restored) Get all meetings from DB
exports.getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ userId: req.user._id }).sort({ date: -1 });
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve meetings." });
    }
};

// (New) Ask a question about meetings in the DB
exports.askAboutMeeting = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'A query is required.' });
        }

        // Use MongoDB's text search to find the most relevant meeting
        const relevantMeeting = await Meeting.findOne(
            { userId: req.user._id, $text: { $search: query } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });

        if (!relevantMeeting) {
            return res.status(404).json({ answer: "I couldn't find a meeting matching that description in your records." });
        }

        const context = `Title: ${relevantMeeting.title}\nSummary: ${relevantMeeting.summary}`;
        const result = await aiService.answerMeetingQuestion({ question: query, context: context });

        res.status(200).json(result);

    } catch (error) {
        console.error('Meeting Q&A error:', error);
        res.status(500).json({ error: 'Failed to answer the question.' });
    }
};