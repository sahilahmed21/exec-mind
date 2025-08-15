// src/controllers/meetingController.js

const Meeting = require('../models/Meeting');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const calendarService = require('../services/calendarService');

// Scenario 1: Process meeting notes/recording after a meeting
exports.createMeetingSummary = async (req, res) => {
    try {
        const { title, participants, date, meetingNotes } = req.body;

        // Use AI to summarize and extract structured data
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

        // Handle follow-ups and actions
        if (aiAnalysis.followUpNeeded) {
            await calendarService.scheduleFollowUp(newMeeting, req.user);
            newMeeting.followUpScheduled = true;
            await newMeeting.save();
        }

        const actionItemInstructions = aiAnalysis.actionItems
            .map(item => `- ${item.description} (Assigned to: ${item.assignedTo})`)
            .join('\n');

        if (actionItemInstructions && req.user.eaEmail) {
            await emailService.sendToEA(
                `Action Items from "${title}"`,
                `Please follow up on these action items:\n${actionItemInstructions}`,
                'action-items'
            );
        }

        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('Error creating meeting summary:', error);
        res.status(500).json({ error: 'Failed to create meeting summary' });
    }
};

// Scenario 2: Get meeting prep before a meeting
exports.getMeetingPrep = async (req, res) => {
    try {
        const { participantName } = req.params;

        const pastMeetings = await Meeting.find({
            userId: req.user._id,
            'participants.name': new RegExp(participantName, 'i')
        }).sort({ date: -1 }).limit(5);

        if (pastMeetings.length === 0) {
            return res.status(200).json({ message: `No past meetings found with ${participantName}.`, briefing: null });
        }

        const briefing = await aiService.prepareMeetingBrief(participantName, pastMeetings);
        res.status(200).json({ message: `Briefing prepared for ${participantName}.`, briefing });
    } catch (error) {
        console.error('Error getting meeting prep:', error);
        res.status(500).json({ error: 'Failed to get meeting prep' });
    }
};

// Get all meetings for the user
exports.getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ userId: req.user._id }).sort({ date: -1 });
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve meetings." });
    }
};