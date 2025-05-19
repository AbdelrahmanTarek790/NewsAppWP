const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.env.FILE_UPLOAD_PATH || 'public/uploads');
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow images, videos, and documents
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png', 
    'image/gif', 
    'image/webp',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type not supported. Allowed types: ${allowedMimeTypes.join(', ')}`, 400), false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: (process.env.MAX_FILE_UPLOAD_SIZE || 5) * 1024 * 1024 // Default 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;