// backend/src/models/Newsletter.js
const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Newsletter title is required'],
        trim: true
    },
    weekOf: {
        type: Date,
        required: [true, 'Week date is required']
    },
    content: {
        type: String,
        required: [true, 'Newsletter content is required']
    },
    htmlContent: String,
    sections: [{
        title: String,
        content: String,
        order: Number,
        type: {
            type: String,
            enum: ['introduction', 'highlights', 'insights', 'people', 'culture', 'closing', 'general'],
            default: 'general'
        }
    }],
    topics: [{
        name: String,
        weight: Number // relevance score
    }],
    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'published'],
        default: 'draft'
    },
    inputSources: [{
        type: {
            type: String,
            enum: ['meeting', 'idea', 'manual', 'voice', 'document']
        },
        sourceId: mongoose.Schema.Types.ObjectId,
        content: String,
        date: Date,
        weight: Number
    }],
    generationMetadata: {
        prompt: String,
        modelUsed: String,
        tokensUsed: Number,
        generationTime: Number,
        iterations: Number
    },
    analytics: {
        wordCount: Number,
        readingTime: Number,
        sentimentScore: Number,
        keyThemes: [String]
    },
    publishedAt: Date,
    publishedTo: [String], // email addresses
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Calculate reading time before saving
newsletterSchema.pre('save', function (next) {
    if (this.isModified('content') && this.content) {
        const words = this.content.split(/\s+/).length;
        if (!this.analytics) {
            this.analytics = {};
        }
        this.analytics.wordCount = words;
        this.analytics.readingTime = Math.ceil(words / 200); // assuming 200 words per minute
    }
    next();
});

// Index for better query performance
newsletterSchema.index({ weekOf: -1 });
newsletterSchema.index({ userId: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ publishedAt: -1 });
newsletterSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Newsletter', newsletterSchema);