// Meeting Model
// Save as: backend/models/Meeting.js

const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        description: 'Duration in minutes'
    },
    maxParticipants: {
        type: Number,
        default: 100
    },
    meetingLink: String,
    recordingUrl: String,
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    attendees: [{
        userId: mongoose.Schema.Types.ObjectId,
        joinedAt: Date,
        leftAt: Date
    }],
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
meetingSchema.index({ teacherId: 1 });
meetingSchema.index({ scheduledAt: 1 });
meetingSchema.index({ status: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
