// Certificate Model
// Save as: backend/models/Certificate.js

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        unique: true,
        required: true
    },
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
    issuedDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: Date,
    grade: String,
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    certificateUrl: String,
    verificationUrl: String,
    isVerified: {
        type: Boolean,
        default: true
    },
    downloadCount: {
        type: Number,
        default: 0
    }
});

// Index for faster lookups
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
