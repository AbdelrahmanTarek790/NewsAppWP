const express = require('express');
const importController = require('../controllers/importController');
const authController = require('../controllers/authController');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.env.FILE_UPLOAD_PATH || 'uploads');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'wp-' + uniqueSuffix + '.xml');
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only XML files
  if (file.mimetype === 'application/xml' || file.mimetype === 'text/xml') {
    cb(null, true);
  } else {
    cb(new Error('Only XML files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max size
  }
});

// All routes require authentication and admin role
router.use(authController.protect);
router.use(authController.restrictTo('admin', 'editor'));

router.post('/upload', upload.single('file'), importController.uploadWordPress);
router.post('/preview', importController.previewWordPressImport);
router.post('/import', importController.importWordPress);
router.get('/status', importController.getImportStatus);
router.delete('/cancel', importController.cancelImport);

module.exports = router;