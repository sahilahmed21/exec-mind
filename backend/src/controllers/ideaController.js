// src/controllers/ideaController.js

const Idea = require('../models/Idea');
const aiService = require('../services/aiService');

// Scenario 3: Capture an idea (text or voice)
exports.createIdea = async (req, res) => {
    try {
        const { content, source } = req.body;
        let ideaContent = content;
        let sourceMetadata = { context: req.body.context || 'Manual input' };

        // If there's an audio file, transcribe it
        if (req.file) {
            ideaContent = await aiService.transcribeAudio(req.file.path);
            sourceMetadata.audioFile = req.file.path;
        }

        if (!ideaContent) {
            return res.status(400).json({ error: 'Idea content is required.' });
        }

        // Use AI to analyze and enrich the idea
        const analysis = await aiService.analyzeIdea(ideaContent);

        const newIdea = new Idea({
            content: ideaContent,
            userId: req.user._id,
            source: req.file ? 'voice' : source,
            sourceMetadata,
            ...analysis
        });

        await newIdea.save();
        res.status(201).json(newIdea);
    } catch (error) {
        console.error('Error creating idea:', error);
        res.status(500).json({ error: 'Failed to create idea' });
    }
};

// Get all ideas for the logged-in user
exports.getIdeas = async (req, res) => {
    try {
        const { startDate } = req.query;
        const query = { userId: req.user._id };

        // ADD THIS CHECK to ensure startDate is not undefined
        if (startDate && !isNaN(new Date(startDate))) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        const ideas = await Idea.find(query).sort({ createdAt: -1 });
        res.status(200).json(ideas);
    } catch (error) {
        console.error('Error in getIdeas:', error);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
};
exports.synthesizeIdea = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'A query is required.' });
        }

        // 1. Retrieve relevant ideas from the database using text search
        const contextIdeas = await Idea.find(
            { userId: req.user._id, $text: { $search: query } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(5); // Limit to top 5 matches

        if (!contextIdeas || contextIdeas.length === 0) {
            return res.status(404).json({ error: "I couldn't find any of your saved ideas matching that topic." });
        }

        // 2. Pass the ideas to the AI for synthesis
        const result = await aiService.synthesizeIdeas({ query, contextIdeas });
        res.status(200).json(result);

    } catch (error) {
        console.error('Idea synthesis error:', error);
        res.status(500).json({ error: 'Failed to synthesize the idea.' });
    }
};
