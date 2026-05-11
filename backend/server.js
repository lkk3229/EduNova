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
const DB_MODE = (config.DB_MODE || 'mongo').toLowerCase();

const dbState = {
    mode: DB_MODE,
    mongodb: {
        configured: Boolean(config.MONGODB_URI),
        required: DB_MODE === 'mongo' || DB_MODE === 'hybrid',
        connected: false,
        lastError: null
    },
    supabase: {
        configured: Boolean(config.SUPABASE_URL && (config.SUPABASE_SERVICE_KEY || config.SUPABASE_ANON_KEY)),
        required: DB_MODE === 'supabase' || DB_MODE === 'hybrid',
        connected: false,
        lastError: null
    }
};

const isReady = () => {
    const mongoReady = !dbState.mongodb.required || dbState.mongodb.connected;
    const supabaseReady = !dbState.supabase.required || dbState.supabase.connected;
    return mongoReady && supabaseReady;
};

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
if (config.MONGODB_URI) {
    mongoose.connection.on('connected', () => {
        dbState.mongodb.connected = true;
        dbState.mongodb.lastError = null;
    });

    mongoose.connection.on('disconnected', () => {
        dbState.mongodb.connected = false;
    });

    mongoose.connection.on('error', (err) => {
        dbState.mongodb.connected = false;
        dbState.mongodb.lastError = err.message;
    });

    mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
        .then(() => logger.info('✓ MongoDB connected successfully'))
        .catch(err => {
            dbState.mongodb.connected = false;
            dbState.mongodb.lastError = err.message;
            logger.warn('⚠ MongoDB unavailable (async): ' + err.message);
            if (dbState.mongodb.required && process.env.NODE_ENV === 'production') {
                logger.error('Production deployment requires MongoDB connectivity in current DB_MODE. Exiting.');
                process.exit(1);
            }
        });
} else if (dbState.mongodb.required) {
    logger.error('DB_MODE requires MongoDB but MONGODB_URI is not configured. Exiting.');
    process.exit(1);
}

// ==================== Supabase PostgreSQL Connection (Phase 8) ====================
if (dbState.supabase.configured) {
    testSupabaseConnection()
        .then((connected) => {
            dbState.supabase.connected = Boolean(connected);
            dbState.supabase.lastError = connected ? null : 'Supabase probe failed';
            if (!connected && dbState.supabase.required && process.env.NODE_ENV === 'production') {
                logger.error('Production deployment requires Supabase connectivity in current DB_MODE. Exiting.');
                process.exit(1);
            }
        })
        .catch(err => {
            dbState.supabase.connected = false;
            dbState.supabase.lastError = err.message;
            logger.warn('⚠ Supabase PostgreSQL unavailable: ' + err.message);
            if (dbState.supabase.required && process.env.NODE_ENV === 'production') {
                logger.error('Production deployment requires Supabase connection in current DB_MODE. Exiting.');
                process.exit(1);
            }
        });
} else if (dbState.supabase.required) {
    logger.error('DB_MODE requires Supabase but SUPABASE_URL / keys are not fully configured. Exiting.');
    process.exit(1);
}

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        ready: isReady(),
        database: {
            mode: dbState.mode,
            mongodb: dbState.mongodb,
            supabase: dbState.supabase
        }
    });
});

// ==================== Readiness Check ====================
app.get('/api/ready', (req, res) => {
    if (!isReady()) {
        return res.status(503).json({
            success: false,
            status: 'not-ready',
            timestamp: new Date(),
            database: {
                mode: dbState.mode,
                mongodb: dbState.mongodb,
                supabase: dbState.supabase
            }
        });
    }

    return res.status(200).json({
        success: true,
        status: 'ready',
        timestamp: new Date(),
        database: {
            mode: dbState.mode,
            mongodb: dbState.mongodb,
            supabase: dbState.supabase
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
