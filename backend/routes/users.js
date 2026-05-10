// Users Routes
// Save as: backend/routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('enrolledCourses', 'title description price')
            .populate('taughtCourses', 'title description price');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        // User can only update their own profile
        if (req.user._id.toString() !== req.params.id && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        // Remove sensitive fields
        const { password, enrolledCourses, certificates, ...updates } = req.body;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/:id/enrollments
// @desc    Get user enrollments
// @access  Private
router.get('/:id/enrollments', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.params.id })
            .populate('courseId', 'title description price');

        res.status(200).json({
            success: true,
            enrollments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/:id/certificates
// @desc    Get user certificates
// @access  Private
router.get('/:id/certificates', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.params.id })
            .populate('courseId', 'title');

        res.status(200).json({
            success: true,
            certificates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this account'
            });
        }

        // Delete user and related data
        await User.findByIdAndDelete(req.params.id);
        await Enrollment.deleteMany({ userId: req.params.id });
        await Certificate.deleteMany({ userId: req.params.id });

        res.status(200).json({
            success: true,
            message: 'User account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
