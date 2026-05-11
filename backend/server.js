// EduNova Backend - Main Server
// Save as: backend/server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Validate environment variables FIRST
const config = require('./config/environment');

// Import logger
const logger = require('./config/logger');
const httpLogger = require('./middleware/httpLogger');
const { performanceMonitor } = require('./middleware/performanceMonitor');
const { auditLogger } = require('./middleware/auditLogger');

// Supabase PostgreSQL client (Phase 8)
const { testConnection: testSupabaseConnection } = require('./config/supabase');

const mongoose = require('mongoose');

const app = express();

// ==================== Security Middleware ====================
// Helmet - Set security HTTP headers
app.use(helmet());

// Custom HTTP Logger - Request logging with Winston
app.use(httpLogger);

// Performance monitor - route latency, slow requests, and error rates
app.use(performanceMonitor);

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true
});

// Apply general rate limiter to all /api routes
app.use('/api/', limiter);

// ==================== Body Parser Middleware ====================
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static upload hosting
app.use('/uploads', express.static(process.env.UPLOAD_PATH || path.join(__dirname, 'uploads')));

// ==================== MongoDB Connection ====================
// Non-blocking connection: server accepts API requests even if MongoDB is unavailable
// This enables API testing without local database setup
mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => logger.info('✓ MongoDB connected successfully'))
    .catch(err => {
        logger.warn('⚠ MongoDB unavailable (async): ' + err.message);
        logger.warn('  API server will accept requests but data persistence disabled.');
        logger.warn('  Provide a running MongoDB instance for production or full feature testing.');
    });

// ==================== Supabase PostgreSQL Connection (Phase 8) ====================
testSupabaseConnection().catch(err => {
    logger.warn('⚠ Supabase PostgreSQL unavailable: ' + err.message);
    if (process.env.NODE_ENV === 'production') {
        logger.error('Production deployment requires Supabase connection. Exiting.');
        process.exit(1);
    }
});

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        database: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            supabase: process.env.SUPABASE_URL ? 'configured' : 'not configured'
        }
    });
});

// ==================== Import Routes ====================
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const certificateRoutes = require('./routes/certificates');
const meetingRoutes = require('./routes/meetings');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/uploads');
const monitoringRoutes = require('./routes/monitoring');

// ==================== Mount Routes ====================
// Apply strict rate limiting to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', auditLogger('admin'), adminRoutes);
app.use('/api/payments', auditLogger('payments'), paymentRoutes);
app.use('/api/uploads', auditLogger('uploads'), uploadRoutes);
app.use('/api/monitoring', auditLogger('monitoring'), monitoringRoutes);

// ==================== Error Handling Middleware ====================
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// ==================== 404 Handler ====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.path}`
    });
});

// ==================== Start Server ====================
const PORT = config.PORT;
app.listen(PORT, () => {
    logger.info(`🚀 EduNova Backend running on http://localhost:${PORT}`);
    logger.info(`📚 API Base: http://localhost:${PORT}/api`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    logger.info(`🔐 Security: Helmet, Rate Limiting, CORS enabled`);
    logger.info(`📁 Log files: backend/logs/`);
});
