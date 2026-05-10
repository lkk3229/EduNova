// Upload Middleware
// Save as: backend/middleware/upload.js

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
        const fullDir = path.join(uploadRoot, folder);

        if (!fs.existsSync(fullDir)) {
            fs.mkdirSync(fullDir, { recursive: true });
        }

        cb(null, fullDir);
    },
    filename: (req, file, cb) => {
        const safeExt = path.extname(file.originalname || '').toLowerCase();
        const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${stamp}${safeExt}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }
    return cb(new Error('Only image files are allowed'), false);
};

const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        return cb(null, true);
    }
    return cb(new Error('Only video files are allowed'), false);
};

const uploadImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadVideo = multer({
    storage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 250 * 1024 * 1024 }
});

module.exports = {
    uploadImage,
    uploadVideo
};
