const aiService = require('../services/aiService');

exports.speak = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required.' });
        }

        // This now returns a stream directly from OpenAI
        const audioStream = await aiService.generateSpeech(text);

        res.setHeader('Content-Type', 'audio/mpeg');

        // Pipe the audio stream directly to the response
        // This starts sending audio to the user immediately
        audioStream.pipe(res);

    } catch (error) {
        res.status(500).json({ error: 'Failed to generate audio.' });
    }
};
