// User Model
// Save as: backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    userType: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    phone: String,
    profilePicture: String,
    bio: String,
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    taughtCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    certificates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return token;
};

// Verify email token
userSchema.methods.verifyEmail = function(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (this.verificationToken !== hashedToken) {
        return false;
    }
    if (new Date() > this.verificationTokenExpiry) {
        return false;
    }
    return true;
};

// Verify password reset token
userSchema.methods.verifyPasswordResetToken = function(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (this.passwordResetToken !== hashedToken) {
        return false;
    }
    if (new Date() > this.passwordResetTokenExpiry) {
        return false;
    }
    return true;
};

module.exports = mongoose.model('User', userSchema);
