// src/controllers/profileController.js

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

// User Registration
exports.register = async (req, res) => {
    try {
        const { name, email, password, eaEmail } = req.body;
        const user = new User({ name, email, password, eaEmail });
        await user.save();
        const token = generateToken(user._id);
        res.status(201).json({ token, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get current user's profile
exports.getProfile = async (req, res) => {
    res.status(200).json(req.user);
};

// Update user's profile (e.g., writing style, EA email)
exports.updateProfile = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'eaEmail', 'writingStyle', 'preferences'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.status(200).json(req.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Scenario 5: Get a book excerpt and send it
exports.sendBookExcerpt = async (req, res) => {
    try {
        const { query, recipient, context } = req.body;
        const user = req.user;

        if (!user.bookExcerpts || user.bookExcerpts.length === 0) {
            return res.status(400).json({ error: 'No book excerpts found on your profile.' });
        }

        // Use AI to find the best excerpt
        const result = await aiService.findBookExcerpt(query, user.bookExcerpts);

        if (!result || !result.bestMatch) {
            return res.status(404).json({ error: 'Could not find a relevant excerpt for your query.' });
        }

        // Send the excerpt via email
        await emailService.sendBookExcerpt(recipient, result.bestMatch.content, context);

        res.status(200).json({
            message: `Excerpt sent successfully to ${recipient}.`,
            excerpt: result.bestMatch
        });

    } catch (error) {
        console.error('Error sending book excerpt:', error);
        res.status(500).json({ error: 'Failed to send book excerpt.' });
    }
};