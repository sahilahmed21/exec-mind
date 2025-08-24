const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Idea content is required'],
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['leadership', 'strategy', 'culture', 'operations', 'innovation', 'people', 'general'],
        default: 'general'
    },
    tags: [{
        type: String,
        trim: true
    }],
    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    source: {
        type: String,
        enum: ['voice', 'text', 'meeting', 'email', 'other'],
        default: 'text'
    },
    sourceMetadata: {
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meeting'
        },
        audioFile: String,
        context: String
    },
    status: {
        type: String,
        enum: ['captured', 'reviewed', 'used', 'archived'],
        default: 'captured'
    },
    usedIn: [{
        type: {
            type: String,
            enum: ['newsletter', 'meeting', 'presentation', 'other']
        },
        reference: String,
        date: Date
    }],
    aiAnalysis: {
        sentiment: String,
        themes: [String],
        actionability: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        relevance: {
            type: Number,
            min: 0,
            max: 1
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better query performance
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ userId: 1 });
ideaSchema.index({ category: 1 });
ideaSchema.index({ priority: -1 });
ideaSchema.index({ status: 1 });
ideaSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Idea', ideaSchema);