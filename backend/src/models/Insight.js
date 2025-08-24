// backend/src/models/Insight.js

const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true
    },
    source: String, // e.g., 'Harvard Business Review'
    readTime: Number, // in minutes
    tags: [String],
    relevance: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    keyPoints: [String],
    link: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

insightSchema.index({ userId: 1, createdAt: -1 });
insightSchema.index({ title: 'text', summary: 'text', tags: 'text', keyPoints: 'text' });

module.exports = mongoose.model('Insight', insightSchema);