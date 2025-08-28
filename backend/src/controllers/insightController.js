// backend/src/controllers/insightController.js
const Insight = require('../models/Insight');
const Meeting = require('../models/Meeting'); // Add this
const Idea = require('../models/Idea');       // Add this
const aiService = require('../services/aiService'); // Add this

// Get all insights for the user
exports.getInsights = async (req, res) => {
    try {
        const { startDate } = req.query;
        const query = { userId: req.user._id };

        // ADD THIS CHECK to ensure startDate is not undefined
        if (startDate && !isNaN(new Date(startDate))) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        const insights = await Insight.find(query).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(insights);
    } catch (error) {
        console.error('Error in getInsights:', error);
        res.status(500).json({ error: 'Failed to retrieve insights.' });
    }
};

// Generate and save weekly insights
exports.generateInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // 1. Gather data from the last week
        const recentMeetings = await Meeting.find({ userId, date: { $gte: sevenDaysAgo } });
        const recentIdeas = await Idea.find({ userId, createdAt: { $gte: sevenDaysAgo } });

        if (recentMeetings.length === 0 && recentIdeas.length === 0) {
            return res.status(400).json({ error: 'Not enough data from the past week to generate insights.' });
        }

        // 2. Call AI service to generate insights
        const context = { recentMeetings, recentIdeas };
        const aiResult = await aiService.generateWeeklyInsights(context);
        const generatedInsights = aiResult.insights;

        // 3. Clear old auto-generated insights
        await Insight.deleteMany({ userId, source: { $regex: /^Synthesized from/ } });

        // 4. Create a dynamic source description
        let sourceDescription = 'Synthesized from ';
        const sources = [];
        if (recentMeetings.length > 0) sources.push(`${recentMeetings.length} Meeting(s)`);
        if (recentIdeas.length > 0) sources.push(`${recentIdeas.length} Idea(s)`);
        sourceDescription += sources.join(' & ');

        // 5. Save the new insights
        const insightsToSave = generatedInsights.map(insight => ({
            ...insight,
            userId,
            source: sourceDescription, // Use the new dynamic source
            readTime: Math.ceil(insight.summary.split(' ').length / 200),
        }));

        const newInsights = await Insight.insertMany(insightsToSave);

        res.status(201).json(newInsights);
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ error: 'Failed to generate insights.' });
    }
};
