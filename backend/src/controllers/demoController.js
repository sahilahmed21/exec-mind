const { getScriptedResponse } = require('../utils/demoScript');

exports.getDemoResponse = (req, res) => {
    try {
        const { turn } = req.body;
        if (turn === undefined || typeof turn !== 'number') {
            return res.status(400).json({ error: 'A valid turn number is required.' });
        }
        const responseText = getScriptedResponse(turn);
        res.status(200).json({ responseText });
    } catch (error) {
        console.error('Demo error:', error);
        res.status(500).json({ error: 'Failed to get demo response.' });
    }
};