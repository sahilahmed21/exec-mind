const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true
    },
    participants: [{
        name: {
            type: String,
            required: true
        },
        email: String,
        role: String
    }],
    date: {
        type: Date,
        required: [true, 'Meeting date is required']
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    summary: {
        type: String,
        required: true
    },
    keyPoints: [{
        point: String,
        importance: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    }],
    actionItems: [{
        description: {
            type: String,
            required: true
        },
        assignedTo: String,
        dueDate: Date,
        completed: {
            type: Boolean,
            default: false
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    }],
    followUpNeeded: {
        type: Boolean,
        default: false
    },
    followUpDate: Date,
    followUpScheduled: {
        type: Boolean,
        default: false
    },
    recording: {
        filename: String,
        path: String,
        transcript: String
    },
    meetingType: {
        type: String,
        enum: ['one-on-one', 'team', 'conference', 'client', 'other'],
        default: 'other'
    },
    tags: [String],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better query performance
meetingSchema.index({ date: -1 });
meetingSchema.index({ userId: 1 });
meetingSchema.index({ 'participants.name': 1 });
meetingSchema.index({ title: 'text', summary: 'text', 'keyPoints.point': 'text', 'participants.name': 'text' });

module.exports = mongoose.model('Meeting', meetingSchema);