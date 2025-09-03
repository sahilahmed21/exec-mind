const { getScriptedResponse } = require('../utils/demoScript');

exports.getDemoResponse = (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'A prompt is required.' });
        }

        const responseLine = getScriptedResponse(prompt);

        if (!responseLine) {
            return res.status(404).json({ responseText: "I don't have a scripted response for that. Please try one of the demo prompts." });
        }

        res.status(200).json(responseLine);

    } catch (error) {
        console.error('Demo error:', error);
        res.status(500).json({ error: 'Failed to get demo response.' });
    }
};