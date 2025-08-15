const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const ensureUploadDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Organize by file type
        if (file.mimetype.startsWith('audio/')) {
            uploadPath = 'uploads/audio/';
        } else if (file.mimetype.startsWith('video/')) {
            uploadPath = 'uploads/video/';
        } else if (file.mimetype.startsWith('image/')) {
            uploadPath = 'uploads/images/';
        } else {
            uploadPath = 'uploads/documents/';
        }

        ensureUploadDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${Date.now()}-${uniqueSuffix}${extension}`;
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        audio: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg', 'audio/mp4'],
        video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        document: ['application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    };

    const allAllowedTypes = [
        ...allowedTypes.audio,
        ...allowedTypes.video,
        ...allowedTypes.image,
        ...allowedTypes.document
    ];

    if (allAllowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
    },
    fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);

        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File too large',
                        maxSize: process.env.MAX_FILE_SIZE || '50MB'
                    });
                }
                return res.status(400).json({
                    error: 'File upload error',
                    details: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    error: err.message
                });
            }
            next();
        });
    };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.array(fieldName, maxCount);

        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File too large',
                        maxSize: process.env.MAX_FILE_SIZE || '50MB'
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        error: `Too many files. Maximum allowed: ${maxCount}`
                    });
                }
                return res.status(400).json({
                    error: 'File upload error',
                    details: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    error: err.message
                });
            }
            next();
        });
    };
};

// Clean up old files (utility function)
const cleanupOldFiles = (directory, maxAgeInDays = 30) => {
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert to milliseconds

    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory for cleanup:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (Date.now() - stats.mtime.getTime() > maxAge) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting old file:', err);
                        } else {
                            console.log(`Deleted old file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
};

// Delete file utility
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    cleanupOldFiles,
    deleteFile
};