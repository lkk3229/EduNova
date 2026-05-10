// Payments Routes
// Save as: backend/routes/payments.js

const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');

const TEACHER_SHARE = 0.6;

const enrollUserIfNeeded = async (user, course) => {
    const existing = await Enrollment.findOne({ userId: user._id, courseId: course._id });
    if (existing) return existing;

    const enrollment = await Enrollment.create({
        userId: user._id,
        courseId: course._id
    });

    if (!course.students.some((id) => id.toString() === user._id.toString())) {
        course.students.push(user._id);
        course.enrollmentCount += 1;
        await course.save();
    }

    if (!user.enrolledCourses.some((id) => id.toString() === course._id.toString())) {
        user.enrolledCourses.push(course._id);
        await user.save();
    }

    return enrollment;
};

// @route   POST /api/payments/checkout/:courseId
// @desc    Start payment checkout (Razorpay if configured, otherwise manual fallback)
// @access  Private
router.post('/checkout/:courseId', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const alreadyEnrolled = await Enrollment.findOne({
            userId: req.user._id,
            courseId: course._id
        });

        if (alreadyEnrolled) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        const amount = Number(course.price || 0);
        if (amount <= 0) {
            const enrollment = await enrollUserIfNeeded(req.user, course);
            return res.status(201).json({
                success: true,
                mode: 'free',
                message: 'Successfully enrolled in free course',
                enrollment
            });
        }

        const teacherShare = Number((amount * TEACHER_SHARE).toFixed(2));
        const platformShare = Number((amount - teacherShare).toFixed(2));
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (keyId && keySecret) {
            // Lazy-load to avoid startup failure when gateway is not configured.
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: transactionId,
                notes: {
                    userId: String(req.user._id),
                    courseId: String(course._id)
                }
            });

            const transaction = await Transaction.create({
                userId: req.user._id,
                courseId: course._id,
                teacherId: course.teacherId,
                amount,
                currency: 'INR',
                provider: 'razorpay',
                status: 'pending',
                teacherShare,
                platformShare,
                transactionId,
                gatewayOrderId: order.id,
                metadata: { receipt: order.receipt }
            });

            return res.status(201).json({
                success: true,
                mode: 'gateway',
                order,
                keyId,
                transaction
            });
        }

        // Manual fallback for development and demo mode.
        const transaction = await Transaction.create({
            userId: req.user._id,
            courseId: course._id,
            teacherId: course.teacherId,
            amount,
            currency: 'INR',
            provider: 'manual',
            status: 'completed',
            teacherShare,
            platformShare,
            transactionId,
            metadata: { manual: true }
        });

        const enrollment = await enrollUserIfNeeded(req.user, course);

        return res.status(201).json({
            success: true,
            mode: 'manual',
            message: 'Payment recorded and enrollment completed',
            transaction,
            enrollment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature and complete enrollment
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const {
            courseId,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature
        } = req.body;

        if (!courseId || !orderId || !paymentId || !signature) {
            return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
        }

        const transaction = await Transaction.findOne({
            userId: req.user._id,
            courseId,
            gatewayOrderId: orderId,
            status: 'pending'
        });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Pending transaction not found' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(400).json({ success: false, message: 'Gateway secret not configured' });
        }

        const digest = crypto
            .createHmac('sha256', secret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        if (digest !== signature) {
            transaction.status = 'failed';
            transaction.gatewayPaymentId = paymentId;
            transaction.gatewaySignature = signature;
            await transaction.save();

            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        transaction.status = 'completed';
        transaction.gatewayPaymentId = paymentId;
        transaction.gatewaySignature = signature;
        await transaction.save();

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const enrollment = await enrollUserIfNeeded(req.user, course);

        return res.status(200).json({
            success: true,
            message: 'Payment verified and enrollment completed',
            transaction,
            enrollment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/payments/mine
// @desc    Get current user payment history
// @access  Private
router.get('/mine', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, transactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/payments
// @desc    Get all transactions (admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, transactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
