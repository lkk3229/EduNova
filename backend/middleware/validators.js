// Input Validation Middleware
// Save as: backend/middleware/validators.js

const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Register validation
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
    
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    
    body('userType')
        .optional()
        .isIn(['student', 'teacher']).withMessage('Invalid user type'),
    
    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidationErrors
];

// Password reset request validation
const validatePasswordResetRequest = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    handleValidationErrors
];

// Password reset confirmation validation
const validatePasswordReset = [
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    
    handleValidationErrors
];

// Course creation validation
const validateCourseCreate = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3-100 characters'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
    
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    
    body('level')
        .isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
    
    body('duration')
        .isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    
    handleValidationErrors
];

// Book creation validation
const validateBookCreate = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3-150 characters'),
    
    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required'),
    
    body('classLevel')
        .isInt({ min: 1, max: 12 }).withMessage('Class level must be between 1-12'),
    
    body('board')
        .isIn(['ncert', 'icse', 'state']).withMessage('Invalid board'),
    
    body('pdfUrl')
        .isURL().withMessage('Please provide a valid PDF URL'),
    
    handleValidationErrors
];

// Meeting creation validation
const validateMeetingCreate = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3-100 characters'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    
    body('scheduledAt')
        .isISO8601().withMessage('Invalid date format')
        .custom(value => new Date(value) > new Date())
        .withMessage('Meeting must be scheduled for future date'),
    
    body('duration')
        .isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15-480 minutes'),
    
    body('meetingLink')
        .isURL().withMessage('Please provide a valid meeting link'),
    
    handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
    
    body('phone')
        .optional()
        .isMobilePhone().withMessage('Please provide a valid phone number'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
    
    handleValidationErrors
];

// Certificate issuance validation
const validateCertificateIssuance = [
    body('courseId')
        .notEmpty().withMessage('Course ID is required')
        .isMongoId().withMessage('Invalid course ID'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRegister,
    validateLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    validateCourseCreate,
    validateBookCreate,
    validateMeetingCreate,
    validateProfileUpdate,
    validateCertificateIssuance
};
