// Meetings Routes
// Save as: backend/routes/meetings.js

const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/meetings
// @desc    Get meetings (upcoming by default)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { status = 'scheduled', courseId, teacherId } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (courseId) filter.courseId = courseId;
        if (teacherId) filter.teacherId = teacherId;

        const meetings = await Meeting.find(filter)
            .populate('teacherId', 'name email profilePicture')
            .populate('courseId', 'title')
            .sort({ scheduledAt: 1 });

        res.status(200).json({
            success: true,
            meetings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/meetings/upcoming
// @desc    Get upcoming meetings
// @access  Public
router.get('/upcoming', async (req, res) => {
    try {
        const now = new Date();
        const meetings = await Meeting.find({
            scheduledAt: { $gte: now },
            status: { $in: ['scheduled', 'ongoing'] }
        })
            .populate('teacherId', 'name email profilePicture')
            .populate('courseId', 'title')
            .sort({ scheduledAt: 1 });

        res.status(200).json({
            success: true,
            meetings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/meetings/:id
// @desc    Get meeting by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('teacherId', 'name email profilePicture bio')
            .populate('courseId', 'title description');

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            meeting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/meetings
// @desc    Create meeting (teacher only)
// @access  Private
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        req.body.teacherId = req.user._id;
        const meeting = await Meeting.create(req.body);

        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate('teacherId', 'name email profilePicture')
            .populate('courseId', 'title');

        res.status(201).json({
            success: true,
            meeting: populatedMeeting
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/meetings/:id
// @desc    Update meeting
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Check authorization
        if (meeting.teacherId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this meeting'
            });
        }

        meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('teacherId', 'name email profilePicture')
            .populate('courseId', 'title');

        res.status(200).json({
            success: true,
            meeting
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/meetings/:id
// @desc    Delete meeting
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Check authorization
        if (meeting.teacherId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this meeting'
            });
        }

        await Meeting.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Meeting deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/meetings/:id/join
// @desc    Join meeting
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Check if already joined
        const alreadyJoined = meeting.attendees.some(a => a.userId.toString() === req.user._id.toString());

        if (!alreadyJoined) {
            meeting.attendees.push({
                userId: req.user._id,
                joinedAt: new Date()
            });
            await meeting.save();
        }

        res.status(200).json({
            success: true,
            message: 'Successfully joined meeting',
            meetingLink: meeting.meetingLink
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
