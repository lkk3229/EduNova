// Course Model
// Save as: backend/models/Course.js

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['programming', 'languages', 'science', 'mathematics', 'arts', 'business', 'personal-development', 'test-prep'],
        default: 'programming'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    price: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    duration: {
        type: Number,
        description: 'Duration in hours'
    },
    thumbnail: String,
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    modules: [{
        title: String,
        description: String,
        duration: Number,
        lessons: [{
            title: String,
            videoUrl: String,
            duration: Number,
            resources: [String],
            order: Number
        }]
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
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
courseSchema.index({ teacherId: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1, category: 1, level: 1, createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
