const Meeting = require('../models/Meeting');
const Idea = require('../models/Idea');
const Insight = require('../models/Insight');
const Newsletter = require('../models/Newsletter');

exports.searchAll = async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user._id;

        if (!q) {
            return res.status(400).json({ error: 'Search query is required.' });
        }

        const searchQuery = { $text: { $search: q }, userId };

        // Perform searches across all models in parallel
        const [meetings, ideas, insights, newsletters] = await Promise.all([
            Meeting.find(searchQuery).limit(10),
            Idea.find(searchQuery).limit(10),
            Insight.find(searchQuery).limit(10),
            Newsletter.find(searchQuery).limit(10)
        ]);

        // Combine and format results
        const results = [
            ...meetings.map(item => ({ ...item.toObject(), type: 'Meeting' })),
            ...ideas.map(item => ({ ...item.toObject(), type: 'Idea' })),
            ...insights.map(item => ({ ...item.toObject(), type: 'Insight' })),
            ...newsletters.map(item => ({ ...item.toObject(), type: 'Newsletter' })),
        ];

        // Optional: Sort results by relevance score if needed in the future
        // For now, we'll keep them grouped by type.

        res.status(200).json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'An error occurred during the search.' });
    }
};