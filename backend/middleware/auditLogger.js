const logger = require('../config/logger');

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const redactSensitive = (value) => {
    if (!value || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
        return value.map((entry) => redactSensitive(entry));
    }

    const redacted = {};
    const sensitivePattern = /(password|token|secret|key|signature|authorization|cookie)/i;

    for (const [k, v] of Object.entries(value)) {
        redacted[k] = sensitivePattern.test(k) ? '[REDACTED]' : redactSensitive(v);
    }

    return redacted;
};

const auditLogger = (scope = 'general') => (req, res, next) => {
    const enabled = process.env.AUDIT_LOGGING_ENABLED !== 'false';
    if (!enabled || !MUTATION_METHODS.has(req.method)) {
        return next();
    }

    const startedAt = Date.now();

    res.on('finish', () => {
        const actor = req.user
            ? {
                id: String(req.user._id || ''),
                role: req.user.userType || 'unknown',
                email: req.user.email || 'unknown'
            }
            : null;

        const event = {
            type: 'audit',
            scope,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            ip: req.ip,
            actor,
            query: redactSensitive(req.query || {}),
            body: redactSensitive(req.body || {})
        };

        logger.info(`[AUDIT] ${JSON.stringify(event)}`);
    });

    next();
};

module.exports = { auditLogger };