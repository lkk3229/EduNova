const logger = require('../config/logger');

const cacheStore = new Map();

const sanitizeTtl = (value) => {
    const ttl = Number(value);
    if (Number.isNaN(ttl) || ttl <= 0) {
        return 60;
    }
    return ttl;
};

const cache = (ttlSeconds = 60) => {
    const ttlMs = sanitizeTtl(ttlSeconds) * 1000;

    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        if (req.headers['cache-control'] === 'no-cache' || req.query.noCache === '1') {
            return next();
        }

        const key = req.originalUrl;
        const now = Date.now();
        const existing = cacheStore.get(key);

        if (existing && existing.expiresAt > now) {
            res.set('X-Cache', 'HIT');
            return res.status(existing.statusCode).json(existing.payload);
        }

        if (existing) {
            cacheStore.delete(key);
        }

        const originalJson = res.json.bind(res);
        res.json = (payload) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                cacheStore.set(key, {
                    payload,
                    statusCode: res.statusCode,
                    expiresAt: now + ttlMs
                });
                res.set('X-Cache', 'MISS');
            }
            return originalJson(payload);
        };

        next();
    };
};

const invalidateCache = (prefix = '') => {
    let removed = 0;
    for (const key of cacheStore.keys()) {
        if (prefix ? key.startsWith(prefix) : true) {
            cacheStore.delete(key);
            removed += 1;
        }
    }
    if (removed > 0) {
        logger.debug(`Cache invalidated for prefix "${prefix}". Removed entries: ${removed}`);
    }
};

const getCacheStats = () => {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const entry of cacheStore.values()) {
        if (entry.expiresAt > now) {
            active += 1;
        } else {
            expired += 1;
        }
    }

    return {
        entries: cacheStore.size,
        active,
        expired
    };
};

module.exports = {
    cache,
    invalidateCache,
    getCacheStats
};
