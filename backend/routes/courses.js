// Courses Routes
// Save as: backend/routes/courses.js

const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');
const { cache, invalidateCache } = require('../middleware/cache');

// @route   GET /api/courses
// @desc    Get all courses with filters
// @access  Public
router.get('/', cache(process.env.CACHE_TTL_SECONDS || 120), async (req, res) => {
    try {
        const { category, level, search, page = 1, limit = 10 } = req.query;

        let filter = { status: 'published' };

        if (category) filter.category = category;
        if (level) filter.level = level;
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const skip = (page - 1) * limit;
        const courses = await Course.find(filter)
            .populate('teacherId', 'name email profilePicture')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

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

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', cache(process.env.CACHE_TTL_SECONDS || 120), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacherId', 'name email profilePicture bio')
            .lean();

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/courses
// @desc    Create course (teacher only)
// @access  Private
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        req.body.teacherId = req.user._id;
        const course = await Course.create(req.body);
        invalidateCache('/api/courses');

        res.status(201).json({
            success: true,
            course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check authorization
        if (course.teacherId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        invalidateCache('/api/courses');

        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check authorization
        if (course.teacherId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this course'
            });
        }

        await Course.findByIdAndDelete(req.params.id);
        invalidateCache('/api/courses');

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private
router.post('/:id/enroll', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        let enrollment = await Enrollment.findOne({
            userId: req.user._id,
            courseId: req.params.id
        });

        if (enrollment) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Create enrollment
        enrollment = await Enrollment.create({
            userId: req.user._id,
            courseId: req.params.id
        });

        // Add student to course
        course.students.push(req.user._id);
        course.enrollmentCount += 1;
        await course.save();

        // Add course to user
        req.user.enrolledCourses.push(req.params.id);
        await req.user.save();

        invalidateCache('/api/courses');

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            enrollment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/courses/:id/progress
// @desc    Get course progress
// @access  Private
router.get('/:id/progress', protect, async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            userId: req.user._id,
            courseId: req.params.id
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        res.status(200).json({
            success: true,
            progress: {
                completionPercentage: enrollment.completionPercentage,
                lessonsCompleted: enrollment.lessonsCompleted.length,
                status: enrollment.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
