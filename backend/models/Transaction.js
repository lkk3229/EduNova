// Transaction Model
// Save as: backend/models/Transaction.js

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    provider: {
        type: String,
        enum: ['razorpay', 'manual'],
        default: 'manual'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    teacherShare: {
        type: Number,
        default: 0
    },
    platformShare: {
        type: Number,
        default: 0
    },
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ courseId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
