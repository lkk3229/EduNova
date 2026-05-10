// Admin Routes
// Save as: backend/routes/admin.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Book = require('../models/Book');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

// Apply admin authorization to all routes
router.use(protect, authorize('admin'));

// ========== USERS MANAGEMENT ==========

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Admin only
router.get('/users', async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        let filter = {};

        if (role) filter.userType = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const users = await User.find(filter)
            .select('-password')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', async (req, res) => {
    try {
        const { userType } = req.body;

        if (!['student', 'teacher', 'admin'].includes(userType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { userType },
            { new: true, runValidators: true }
        ).select('-password');

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

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin if only one exists
        if (user.userType === 'admin') {
            const adminCount = await User.countDocuments({ userType: 'admin' });
            if (adminCount === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the only admin user'
                });
            }
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== COURSES MANAGEMENT ==========

// @route   GET /api/admin/courses
// @desc    Get all courses (including drafts)
// @access  Admin only
router.get('/courses', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        let filter = {};

        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const courses = await Course.find(filter)
            .populate('instructorId', 'name email')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Course.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/courses/:id/approve
// @desc    Approve course for publishing
// @access  Admin only
router.put('/courses/:id/approve', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'active', approvedAt: new Date(), approvedBy: req.user._id },
            { new: true, runValidators: true }
        ).populate('instructorId', 'name email');

        res.status(200).json({
            success: true,
            message: 'Course approved successfully',
            course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/courses/:id/reject
// @desc    Reject course
// @access  Admin only
router.put('/courses/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason: reason },
            { new: true, runValidators: true }
        ).populate('instructorId', 'name email');

        res.status(200).json({
            success: true,
            message: 'Course rejected',
            course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ========== BOOKS MANAGEMENT ==========

// @route   GET /api/admin/books
// @desc    Get all books
// @access  Admin only
router.get('/books', async (req, res) => {
    try {
        const { board, page = 1, limit = 20 } = req.query;
        let filter = {};

        if (board) filter.board = board;

        const skip = (page - 1) * limit;
        const books = await Book.find(filter)
            .populate('authorId', 'name email')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

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

// @route   DELETE /api/admin/books/:id
// @desc    Delete book
// @access  Admin only
router.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

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

// ========== CERTIFICATES MANAGEMENT ==========

// @route   GET /api/admin/certificates
// @desc    Get all issued certificates
// @access  Admin only
router.get('/certificates', async (req, res) => {
    try {
        const { courseId, page = 1, limit = 10 } = req.query;
        let filter = {};

        if (courseId) filter.courseId = courseId;

        const skip = (page - 1) * limit;
        const certificates = await Certificate.find(filter)
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ issuedAt: -1 });

        const total = await Certificate.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            certificates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/admin/certificates/:id
// @desc    Revoke certificate
// @access  Admin only
router.delete('/certificates/:id', async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            { status: 'revoked', revokedAt: new Date() },
            { new: true }
        );

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certificate revoked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== PLATFORM STATISTICS ==========

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Admin only
router.get('/stats/overview', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ userType: 'student' });
        const totalTeachers = await User.countDocuments({ userType: 'teacher' });
        const totalCourses = await Course.countDocuments({ status: 'active' });
        const totalBooks = await Book.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        const totalCertificates = await Certificate.countDocuments({ status: 'valid' });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalCourses,
                totalBooks,
                totalEnrollments,
                totalCertificates
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/stats/enrollments
// @desc    Get enrollment statistics
// @access  Admin only
router.get('/stats/enrollments', async (req, res) => {
    try {
        const enrollmentsByStatus = await Enrollment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const avgProgress = await Enrollment.aggregate([
            {
                $group: {
                    _id: null,
                    averageProgress: { $avg: '$progress' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            enrollmentsByStatus,
            averageProgress: avgProgress[0]?.averageProgress || 0
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
