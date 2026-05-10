// Email Service
// Save as: backend/services/emailService.js

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send verification email
const sendVerificationEmail = async (user, verificationToken, frontendUrl) => {
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"EduNova" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🎓 Verify Your EduNova Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Welcome to EduNova!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>Thank you for signing up on EduNova. To activate your account, please verify your email by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">Verify Email Address</a>
                    </div>
                    
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="background: #fff; padding: 10px; border-left: 4px solid #667eea; word-break: break-all; font-size: 12px;">
                        ${verificationUrl}
                    </p>
                    
                    <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        If you didn't create this account, please ignore this email.<br>
                        &copy; 2026 EduNova. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Verification email sent' };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, message: 'Failed to send verification email' };
    }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken, frontendUrl) => {
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"EduNova" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔐 Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Password Reset Request</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">Reset Password</a>
                    </div>
                    
                    <p>Or copy this link:</p>
                    <p style="background: #fff; padding: 10px; border-left: 4px solid #667eea; word-break: break-all; font-size: 12px;">
                        ${resetUrl}
                    </p>
                    
                    <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404; font-size: 12px;">
                            <strong>⚠️ Security tip:</strong> If you didn't request this password reset, please ignore this email. Your account is secure.
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        &copy; 2026 EduNova. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Password reset email sent' };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, message: 'Failed to send password reset email' };
    }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const mailOptions = {
        from: `"EduNova" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '👋 Welcome to EduNova!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Welcome, ${user.name}!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                    <p>Your account is now active and ready to use!</p>
                    
                    <h3 style="color: #667eea;">What you can do now:</h3>
                    <ul style="color: #555;">
                        <li>📚 Explore thousands of NCERT books and textbooks</li>
                        <li>🎓 Enroll in interactive courses</li>
                        <li>🎤 Participate in live class sessions</li>
                        <li>📜 Earn certificates upon course completion</li>
                        <li>🤖 Use our AI-powered learning assistant</li>
                    </ul>
                    
                    <p>Start your learning journey today!</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL}" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">Go to EduNova</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        Need help? Contact us at support@edunova.com<br>
                        &copy; 2026 EduNova. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false };
    }
};

// Send course enrollment confirmation
const sendEnrollmentConfirmation = async (user, courseName) => {
    const mailOptions = {
        from: `"EduNova" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `✅ Enrollment Confirmed - ${courseName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">🎉 You're Enrolled!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>You have successfully enrolled in <strong>${courseName}</strong>!</p>
                    
                    <p>You can now:</p>
                    <ul style="color: #555;">
                        <li>Access all course materials</li>
                        <li>Watch video lectures</li>
                        <li>Join live class sessions</li>
                        <li>Download resources</li>
                        <li>Track your progress</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL}/courses" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">Go to Course</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        &copy; 2026 EduNova. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false };
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendEnrollmentConfirmation
};
