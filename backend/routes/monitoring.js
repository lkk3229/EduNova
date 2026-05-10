const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const { getPerformanceSnapshot, resetPerformanceMetrics } = require('../middleware/performanceMonitor');
const { getCacheStats, invalidateCache } = require('../middleware/cache');

const router = express.Router();

router.get('/metrics', protect, authorize('admin'), (req, res) => {
    const performance = getPerformanceSnapshot();

    res.status(200).json({
        success: true,
        metrics: {
            performance,
            cache: getCacheStats()
        }
    });
});

router.post('/metrics/reset', protect, authorize('admin'), (req, res) => {
    resetPerformanceMetrics();
    res.status(200).json({
        success: true,
        message: 'Performance metrics reset successfully.'
    });
});

router.post('/cache/clear', protect, authorize('admin'), (req, res) => {
    const prefix = typeof req.body?.prefix === 'string' ? req.body.prefix : '';
    invalidateCache(prefix);

    res.status(200).json({
        success: true,
        message: prefix
            ? `Cache entries cleared for prefix: ${prefix}`
            : 'All cache entries cleared.',
        cache: getCacheStats()
    });
});

module.exports = router;
