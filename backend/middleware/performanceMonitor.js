const logger = require('../config/logger');

const routeMetrics = new Map();
const processStart = Date.now();

const toNumber = (value, fallback) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return fallback;
    }
    return parsed;
};

const MAX_ROUTE_SAMPLES = Math.max(10, toNumber(process.env.PERF_MAX_ROUTE_SAMPLES, 200));
const SLOW_REQUEST_MS = Math.max(50, toNumber(process.env.PERF_SLOW_REQUEST_MS, 1000));

const globalStats = {
    totalRequests: 0,
    totalErrors: 0,
    totalDurationMs: 0,
    slowRequests: 0
};

const updateRouteMetric = (routeKey, durationMs, statusCode) => {
    const metric = routeMetrics.get(routeKey) || {
        route: routeKey,
        count: 0,
        errors: 0,
        totalDurationMs: 0,
        maxDurationMs: 0,
        minDurationMs: Number.MAX_SAFE_INTEGER,
        recent: []
    };

    metric.count += 1;
    metric.totalDurationMs += durationMs;
    metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
    metric.minDurationMs = Math.min(metric.minDurationMs, durationMs);

    if (statusCode >= 400) {
        metric.errors += 1;
    }

    metric.recent.push(durationMs);
    if (metric.recent.length > MAX_ROUTE_SAMPLES) {
        metric.recent.shift();
    }

    routeMetrics.set(routeKey, metric);
};

const performanceMonitor = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const routeKey = `${req.method} ${req.baseUrl || ''}${req.route ? req.route.path : req.path}`;

        globalStats.totalRequests += 1;
        globalStats.totalDurationMs += durationMs;
        if (res.statusCode >= 400) {
            globalStats.totalErrors += 1;
        }

        if (durationMs >= SLOW_REQUEST_MS) {
            globalStats.slowRequests += 1;
            logger.warn(
                `[PERF] Slow request detected (${durationMs.toFixed(2)}ms): ${req.method} ${req.originalUrl} -> ${res.statusCode}`
            );
        }

        updateRouteMetric(routeKey, durationMs, res.statusCode);
    });

    next();
};

const getPerformanceSnapshot = () => {
    const avgMs = globalStats.totalRequests > 0
        ? globalStats.totalDurationMs / globalStats.totalRequests
        : 0;

    const routes = Array.from(routeMetrics.values()).map((metric) => ({
        route: metric.route,
        count: metric.count,
        errors: metric.errors,
        avgDurationMs: metric.totalDurationMs / metric.count,
        maxDurationMs: metric.maxDurationMs,
        minDurationMs: metric.minDurationMs === Number.MAX_SAFE_INTEGER ? 0 : metric.minDurationMs,
        p95DurationMs: getP95(metric.recent)
    }));

    routes.sort((a, b) => b.avgDurationMs - a.avgDurationMs);

    return {
        collectedAt: new Date().toISOString(),
        uptimeMs: Date.now() - processStart,
        process: {
            rssMb: +(process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
            heapUsedMb: +(process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2),
            heapTotalMb: +(process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2),
            cpuUsage: process.cpuUsage()
        },
        totals: {
            requests: globalStats.totalRequests,
            errors: globalStats.totalErrors,
            slowRequests: globalStats.slowRequests,
            averageDurationMs: +avgMs.toFixed(2),
            errorRate: globalStats.totalRequests > 0
                ? +((globalStats.totalErrors / globalStats.totalRequests) * 100).toFixed(2)
                : 0
        },
        routes
    };
};

const resetPerformanceMetrics = () => {
    routeMetrics.clear();
    globalStats.totalRequests = 0;
    globalStats.totalErrors = 0;
    globalStats.totalDurationMs = 0;
    globalStats.slowRequests = 0;
};

const getP95 = (samples) => {
    if (!samples || samples.length === 0) {
        return 0;
    }
    const sorted = [...samples].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    return +sorted[idx].toFixed(2);
};

module.exports = {
    performanceMonitor,
    getPerformanceSnapshot,
    resetPerformanceMetrics
};
