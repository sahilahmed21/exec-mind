// backend/src/controllers/newsletterController.js

const Newsletter = require('../models/Newsletter');
const Meeting = require('../models/Meeting');
const Idea = require('../models/Idea');
const aiService = require('../services/aiService');

// Scenario 4: Generate Friday Notes
exports.generateNewsletter = async (req, res) => {
    try {
        const { weekOf, manualInputs, sourceIds } = req.body; // sourceIds can be used for tracking
        const userId = req.user._id;

        // 1. Gather data sources (using the provided sourceIds is more precise)
        const selectedMeetings = await Meeting.find({ _id: { $in: sourceIds }, userId });
        const selectedIdeas = await Idea.find({ _id: { $in: sourceIds }, userId });

        // 2. Call AI service to generate content
        const context = {
            recentMeetings: selectedMeetings,
            recentIdeas: selectedIdeas,
            manualInputs,
            user: req.user,
        };
        const aiContent = await aiService.generateNewsletter(context); // Expects { subject, body }

        // 3. Create and save the newsletter draft using the new format
        const newNewsletter = new Newsletter({
            title: aiContent.subject, // Use subject for the title
            weekOf: weekOf || new Date(),
            content: aiContent.body,   // Use body for the main content
            // The 'sections' field will now be empty, which is fine.
            sections: [{ title: "Main Body", content: aiContent.body, order: 1, type: 'general' }],
            status: 'draft',
            userId,
            // You can still log the input sources for reference
            inputSources: [
                ...selectedMeetings.map(m => ({ type: 'meeting', sourceId: m._id, content: m.summary })),
                ...selectedIdeas.map(i => ({ type: 'idea', sourceId: i._id, content: i.content }))
            ]
        });

        await newNewsletter.save();

        res.status(201).json(newNewsletter);
    } catch (error) {
        console.error('Error generating newsletter:', error);
        res.status(500).json({ error: 'Failed to generate newsletter' });
    }
};

// Get all newsletters
exports.getNewsletters = async (req, res) => {
    try {
        const newsletters = await Newsletter.find({ userId: req.user._id }).sort({ weekOf: -1 });
        res.status(200).json(newsletters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch newsletters' });
    }
};

// Get a single newsletter by ID
exports.getNewsletterById = async (req, res) => {
    try {
        const newsletter = await Newsletter.findOne({ _id: req.params.id, userId: req.user._id });
        if (!newsletter) {
            return res.status(404).json({ error: 'Newsletter not found.' });
        }
        res.status(200).json(newsletter);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch newsletter.' });
    }
};