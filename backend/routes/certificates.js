// Certificates Routes
// Save as: backend/routes/certificates.js

const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

// Generate unique certificate ID
const generateCertificateId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ENOVA-${timestamp}-${random}`;
};

// @route   GET /api/certificates
// @desc    Get all certificates (user certificates if student, all if admin)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let filter = {};

        // Students see only their certificates
        if (req.user.userType === 'student') {
            filter.userId = req.user._id;
        }

        const certificates = await Certificate.find(filter)
            .populate('courseId', 'title')
            .populate('userId', 'name email')
            .sort({ issuedDate: -1 });

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

// @route   GET /api/certificates/:id
// @desc    Get certificate by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('courseId', 'title description')
            .populate('userId', 'name email');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.status(200).json({
            success: true,
            certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/certificates
// @desc    Issue certificate (teacher/admin only)
// @access  Private
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { userId, courseId, score, grade } = req.body;

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check authorization (teacher can only issue for their courses)
        if (req.user.userType === 'teacher' && course.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to issue certificates for this course'
            });
        }

        // Check if certificate already issued
        let existingCert = await Certificate.findOne({ userId, courseId });
        if (existingCert) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already issued for this course'
            });
        }

        // Create certificate
        const certificateId = generateCertificateId();
        const certificate = await Certificate.create({
            certificateId,
            userId,
            courseId,
            score,
            grade,
            verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}`
        });

        // Update enrollment
        await Enrollment.findOneAndUpdate(
            { userId, courseId },
            { certificateIssued: true, certificateId: certificate._id, status: 'completed' }
        );

        res.status(201).json({
            success: true,
            certificate
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/certificates/verify/:certificateId
// @desc    Verify certificate authenticity
// @access  Public
router.get('/verify/:certificateId', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({
            certificateId: req.params.certificateId,
            isVerified: true
        })
            .populate('courseId', 'title')
            .populate('userId', 'name');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Certificate not found or invalid'
            });
        }

        res.status(200).json({
            success: true,
            valid: true,
            data: {
                certificateId: certificate.certificateId,
                studentName: certificate.userId.name,
                courseName: certificate.courseId.title,
                grade: certificate.grade,
                score: certificate.score,
                issuedDate: certificate.issuedDate,
                expiryDate: certificate.expiryDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete certificate (admin only)
// @access  Private
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndDelete(req.params.id);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certificate deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
