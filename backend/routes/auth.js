// Authentication Routes
// Save as: backend/routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordResetRequest, validatePasswordReset } = require('../middleware/validators');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password,
            userType: userType || 'student'
        });

        // Generate verification token
        const verificationToken = user.generateVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        await sendVerificationEmail(user, verificationToken, frontendUrl);

        // Create token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if email verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for verification link.',
                action: 'verify_email'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get current logged in user
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('enrolledCourses');

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

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
    // JWT is stateless, so logout on frontend by removing token
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // Find user with verification token
        const user = await User.findOne({
            verificationToken: require('crypto').createHash('sha256').update(token).digest('hex'),
            verificationTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Verify email
        if (!user.verifyEmail(token)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        await sendVerificationEmail(user, verificationToken, frontendUrl);

        res.status(200).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', validatePasswordResetRequest, async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if email exists
            return res.status(200).json({
                success: true,
                message: 'If that email address is in our system, you will receive a password reset link shortly.'
            });
        }

        // Generate password reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send password reset email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        await sendPasswordResetEmail(user, resetToken, frontendUrl);

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', validatePasswordReset, async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        // Find user with reset token
        const user = await User.findOne({
            passwordResetToken: require('crypto').createHash('sha256').update(token).digest('hex'),
            passwordResetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Verify token
        if (!user.verifyPasswordResetToken(token)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        await user.save();

        // Create token for auto-login
        const authToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            token: authToken,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
