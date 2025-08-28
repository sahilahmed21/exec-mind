const aiService = require('../services/aiService');
const { retrieveContext } = require('../utils/knowledgeBase'); // Import the retriever

exports.analyze = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'A query is required.' });
        }

        // 1. Retrieve the relevant context based on the query
        const context = retrieveContext(query);
        if (!context) {
            return res.status(404).json({ error: 'No relevant context found for this query.' });
        }

        // 2. Pass both to the AI for analysis
        const analysisResult = await aiService.analyzeDocument({ query, context });
        res.status(200).json(analysisResult);

    } catch (error) {
        console.error('Document analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze the document.' });
    }
};