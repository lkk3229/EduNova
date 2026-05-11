// Environment Configuration & Validation
// Save as: backend/config/environment.js

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Required environment variables
const REQUIRED_VARS = {
    NODE_ENV: { default: 'development', type: 'string' },
    PORT: { default: 5000, type: 'number' },
    DB_MODE: { default: 'mongo', type: 'string', allowedValues: ['mongo', 'supabase', 'hybrid'] },
    // Database: Supabase (primary) or MongoDB (fallback)
    SUPABASE_URL: { required: false, type: 'string' },
    SUPABASE_ANON_KEY: { required: false, type: 'string' },
    SUPABASE_SERVICE_KEY: { required: false, type: 'string' },
    MONGODB_URI: { required: false, type: 'string' },
    // Authentication
    JWT_SECRET: { required: true, type: 'string', minLength: 32 },
    JWT_EXPIRE: { default: '7d', type: 'string' },
    // Server/App
    CORS_ORIGIN: { default: 'http://localhost:3000', type: 'string' },
    FRONTEND_URL: { required: true, type: 'string' },
    // Email
    EMAIL_SERVICE: { required: true, type: 'string' },
    EMAIL_USER: { required: true, type: 'string' },
    EMAIL_PASS: { required: true, type: 'string' },
    // Logging & Monitoring
    LOG_LEVEL: { default: 'debug', type: 'string' },
    AUDIT_LOGGING_ENABLED: { default: true, type: 'boolean' },
    // File Upload
    UPLOAD_PATH: { default: './uploads', type: 'string' },
    // Performance & Cache
    ENABLE_RESPONSE_CACHE: { default: true, type: 'boolean' },
    CACHE_TTL_SECONDS: { default: 120, type: 'number' },
    PERF_SLOW_REQUEST_MS: { default: 1000, type: 'number' },
    PERF_MAX_ROUTE_SAMPLES: { default: 200, type: 'number' },
    // Payments (optional)
    RAZORPAY_KEY_ID: { default: '', type: 'string' },
    RAZORPAY_KEY_SECRET: { default: '', type: 'string' },
    // Observability (optional)
    SENTRY_DSN: { default: '', type: 'string' }
};

// Validate environment variables
const validateEnvironment = () => {
    const errors = [];
    const warnings = [];
    const config = {};

    console.log('\n🔍 Validating environment variables...\n');

    // Check each required variable
    for (const [key, rules] of Object.entries(REQUIRED_VARS)) {
        const value = process.env[key];

        // Check if required
        if (rules.required && !value) {
            errors.push(`❌ ${key}: REQUIRED but not set`);
            continue;
        }

        // Use default if not provided
        if (!value && rules.default !== undefined) {
            config[key] = rules.default;
            console.log(`⚠️  ${key}: Using default value`);
            continue;
        }

        // Validate type
        if (value) {
            if (rules.type === 'number') {
                const num = Number(value);
                if (isNaN(num)) {
                    errors.push(`❌ ${key}: Must be a number, got "${value}"`);
                    continue;
                }
                config[key] = num;
            } else if (rules.type === 'boolean') {
                if (value === 'true' || value === '1') {
                    config[key] = true;
                } else if (value === 'false' || value === '0') {
                    config[key] = false;
                } else {
                    errors.push(`❌ ${key}: Must be boolean (true/false/1/0), got "${value}"`);
                    continue;
                }
            } else if (rules.type === 'string') {
                config[key] = value;
            }

            // Validate allowed values
            if (rules.allowedValues && !rules.allowedValues.includes(String(value).toLowerCase())) {
                errors.push(`❌ ${key}: Must be one of [${rules.allowedValues.join(', ')}], got "${value}"`);
            }

            // Validate minimum length
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`❌ ${key}: Must be at least ${rules.minLength} characters (got ${value.length})`);
            }

            // Validate JWT secret in production
            if (key === 'JWT_SECRET' && process.env.NODE_ENV === 'production') {
                if (value === 'dev-secret' || value.length < 32) {
                    errors.push(`❌ ${key}: Production requires strong secret (min 32 chars). Current: ${value.length} chars`);
                }
            }

            // Validate email configuration
            if (key === 'EMAIL_USER' && value) {
                if (!value.includes('@')) {
                    errors.push(`❌ ${key}: Invalid email format - "${value}"`);
                }
            }

            // Validate URLs
            if ((key === 'FRONTEND_URL' || key === 'CORS_ORIGIN') && value) {
                try {
                    new URL(value);
                } catch (e) {
                    errors.push(`❌ ${key}: Invalid URL format - "${value}"`);
                }
            }
        }
    }

    const dbMode = (process.env.DB_MODE || config.DB_MODE || 'mongo').toLowerCase();
    const hasSupabase = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY));
    const hasMongoDB = Boolean(process.env.MONGODB_URI);

    // DB mode checks (all environments)
    if ((dbMode === 'mongo' || dbMode === 'hybrid') && !hasMongoDB) {
        errors.push('❌ DATABASE: MONGODB_URI is required when DB_MODE is mongo or hybrid');
    }

    if ((dbMode === 'supabase' || dbMode === 'hybrid') && !hasSupabase) {
        errors.push('❌ DATABASE: SUPABASE_URL and one key (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY) are required when DB_MODE is supabase or hybrid');
    }

    // Production-specific checks
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET === 'dev-secret') {
            errors.push('❌ SECURITY: JWT_SECRET is set to default dev value in production!');
        }

        if (!hasSupabase && !hasMongoDB) {
            errors.push('❌ DATABASE: At least one database must be configured in production');
        }
        
        // Validate Supabase URL format
        if (process.env.SUPABASE_URL) {
            try {
                const url = new URL(process.env.SUPABASE_URL);
                if (!url.hostname.includes('supabase.co')) {
                    warnings.push('⚠️  SUPABASE_URL: Does not appear to be a valid Supabase URL (should contain supabase.co)');
                }
            } catch (e) {
                errors.push(`❌ SUPABASE_URL: Invalid URL format - "${process.env.SUPABASE_URL}"`);
            }
        }
        
        // Product currently runs Mongoose routes, so mongo mode is enforced for production stability.
        if (dbMode === 'supabase') {
            warnings.push('⚠️  DATABASE: DB_MODE=supabase is not yet route-complete. Use DB_MODE=mongo for stable production runtime.');
        }

        if (dbMode === 'mongo' && hasSupabase) {
            warnings.push('⚠️  DATABASE: Supabase is configured but currently treated as optional telemetry/preview while routes remain Mongo-backed.');
        }
    }

    // Display results
    if (errors.length > 0) {
        console.log('❌ VALIDATION FAILED:\n');
        errors.forEach(err => console.log(`   ${err}`));
        console.log('\n📋 Please fix the above errors in your .env file\n');
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        warnings.forEach(warn => console.log(`   ${warn}`));
        console.log('');
    }

    // Display validated config (without secrets)
    console.log('✅ ENVIRONMENT VALIDATION PASSED:\n');
    Object.entries(config).forEach(([key, value]) => {
        const displayValue = (key.includes('SECRET') || key.includes('PASS')) 
            ? '***' + String(value).slice(-4)
            : String(value).length > 50 
            ? String(value).substring(0, 47) + '...'
            : value;
        console.log(`   ✓ ${key}: ${displayValue}`);
    });
    console.log('');

    return config;
};

// Export validated config
module.exports = {
    ...validateEnvironment(),
    validate: validateEnvironment
};
