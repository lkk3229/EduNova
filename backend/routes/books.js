// Books Routes
// Save as: backend/routes/books.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorize } = require('../middleware/auth');
const { cache, invalidateCache } = require('../middleware/cache');

// @route   GET /api/books
// @desc    Get all books with filters
// @access  Public
router.get('/', cache(process.env.CACHE_TTL_SECONDS || 120), async (req, res) => {
    try {
        const { board, classLevel, subject, search, page = 1, limit = 10 } = req.query;

        let filter = {};

        if (board) filter.board = board;
        if (classLevel) filter.classLevel = classLevel;
        if (subject) filter.subject = new RegExp(subject, 'i');
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { subject: new RegExp(search, 'i') }
            ];
        }

        const skip = (page - 1) * limit;
        const books = await Book.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        const total = await Book.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/books
// @desc    Create new book (admin only)
// @access  Private
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const book = await Book.create(req.body);
        invalidateCache('/api/books');

        res.status(201).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/books/:id
// @desc    Update book (admin only)
// @access  Private
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        invalidateCache('/api/books');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (admin only)
// @access  Private
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        invalidateCache('/api/books');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
