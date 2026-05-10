// Enrollment Model
// Save as: backend/models/Enrollment.js

const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastAccessedAt: Date,
    completedAt: Date,
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
    },
    lessonsCompleted: [String],
    progress: {
        videosWatched: Number,
        quizzesCompleted: Number,
        assignmentsSubmitted: Number
    }
});

// Unique index on userId and courseId
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
