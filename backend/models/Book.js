// Book Model
// Save as: backend/models/Book.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a book title'],
        trim: true
    },
    description: String,
    author: String,
    subject: {
        type: String,
        required: true
    },
    classLevel: {
        type: Number,
        min: 1,
        max: 12
    },
    board: {
        type: String,
        enum: ['NCERT', 'ICSE', 'StateBoard'],
        default: 'NCERT'
    },
    stream: {
        type: String,
        enum: ['General', 'Science', 'Commerce', 'Arts'],
        default: 'General'
    },
    pdfUrl: String,
    thumbnail: String,
    chapters: [{
        number: Number,
        title: String,
        summary: String,
        concepts: [String]
    }],
    tags: [String],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster searches
bookSchema.index({ board: 1, classLevel: 1 });
bookSchema.index({ subject: 1 });
bookSchema.index({ tags: 1 });

module.exports = mongoose.model('Book', bookSchema);
