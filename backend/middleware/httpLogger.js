// HTTP Request Logger Middleware
// Save as: backend/middleware/httpLogger.js

const logger = require('../config/logger');

/**
 * Custom HTTP logger middleware
 * Logs all incoming requests with method, path, status, response time, IP
 */
const httpLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Attach requestId to request object for later use
    req.id = requestId;

    // Store original end function
    const originalEnd = res.end;

    // Override end function to capture response
    res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const method = req.method;
        const path = req.path;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent') || 'Unknown';

        // Build log message
        const logMessage = `[${requestId}] ${method} ${path} - ${statusCode} - ${duration}ms - ${ip}`;

        // Log based on status code
        if (statusCode >= 500) {
            logger.error(logMessage);
        } else if (statusCode >= 400) {
            logger.warn(logMessage);
        } else {
            logger.http(logMessage);
        }

        // Log request body for POST/PUT/PATCH (excluding passwords)
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const body = sanitizeBody(req.body);
            logger.debug(`[${requestId}] Request Body: ${JSON.stringify(body)}`);
        }

        // Log response headers for errors
        if (statusCode >= 400) {
            logger.debug(`[${requestId}] Response: ${chunk}`);
        }

        // Call original end function
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}${random}`.toUpperCase();
};

/**
 * Sanitize request body (remove sensitive fields)
 */
const sanitizeBody = (body) => {
    if (!body) return {};
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'confirmPassword', 'token', 'secret'];
    
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***';
        }
    });
    
    return sanitized;
};

module.exports = httpLogger;
