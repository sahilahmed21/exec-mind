// src/controllers/newsletterController.js

const Newsletter = require('../models/Newsletter');
const Meeting = require('../models/Meeting');
const Idea = require('../models/Idea');
const aiService = require('../services/aiService');

// Scenario 4: Generate Friday Notes
exports.generateNewsletter = async (req, res) => {
    try {
        const { weekOf, manualInputs } = req.body;
        const userId = req.user._id;

        // 1. Gather data sources
        const sevenDaysAgo = new Date(new Date(weekOf).getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentMeetings = await Meeting.find({
            userId,
            date: { $gte: sevenDaysAgo, $lte: new Date(weekOf) }
        }).limit(10);

        const recentIdeas = await Idea.find({
            userId,
            status: 'captured', // Only use fresh ideas
            createdAt: { $gte: sevenDaysAgo }
        }).limit(15);

        // 2. Call AI service to generate content
        const context = {
            recentMeetings,
            recentIdeas,
            manualInputs,
            user: req.user,
        };
        const aiContent = await aiService.generateNewsletter(context);

        // 3. Create and save the newsletter draft
        const fullContentString = aiContent.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');

        const newNewsletter = new Newsletter({
            title: aiContent.title,
            weekOf,
            content: fullContentString,
            sections: aiContent.sections,
            analytics: aiContent.analytics,
            status: 'draft',
            userId,
            inputSources: [
                ...recentMeetings.map(m => ({ type: 'meeting', sourceId: m._id, content: m.summary })),
                ...recentIdeas.map(i => ({ type: 'idea', sourceId: i._id, content: i.content }))
            ]
        });

        await newNewsletter.save();

        // Optional: Mark ideas as 'used'
        await Idea.updateMany(
            { _id: { $in: recentIdeas.map(i => i._id) } },
            { $set: { status: 'reviewed' }, $push: { usedIn: { type: 'newsletter', reference: newNewsletter._id, date: new Date() } } }
        );

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