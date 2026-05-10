// Upload Routes
// Save as: backend/routes/uploads.js

const path = require('path');
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../middleware/upload');

const toPublicUrl = (filePath) => {
    const normalized = filePath.replace(/\\/g, '/');
    const marker = '/uploads/';
    const idx = normalized.lastIndexOf(marker);
    return idx >= 0 ? normalized.substring(idx) : `/uploads/${path.basename(filePath)}`;
};

// @route   POST /api/uploads/image
// @desc    Upload image (thumbnail, profile, etc.)
// @access  Private (teacher/admin)
router.post('/image', protect, authorize('teacher', 'admin'), uploadImage.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        file: {
            name: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: toPublicUrl(req.file.path)
        }
    });
});

// @route   POST /api/uploads/video
// @desc    Upload course video asset
// @access  Private (teacher/admin)
router.post('/video', protect, authorize('teacher', 'admin'), uploadVideo.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    return res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        file: {
            name: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: toPublicUrl(req.file.path)
        }
    });
});

module.exports = router;
