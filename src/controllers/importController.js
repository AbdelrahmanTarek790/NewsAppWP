const path = require('path');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const WordPressImport = require('../utils/wordpressImport');

// Track import status
const importStatus = {
  inProgress: false,
  startTime: null,
  endTime: null,
  userId: null,
  stats: null,
  error: null
};

exports.uploadWordPress = catchAsync(async (req, res, next) => {
  // Check if an import is already in progress
  if (importStatus.inProgress) {
    return next(new AppError('An import is already in progress. Please wait or cancel the current import.', 409));
  }
  
  // Check if file was uploaded
  if (!req.file) {
    return next(new AppError('Please upload a WordPress XML file', 400));
  }
  
  // Check file type
  if (path.extname(req.file.originalname).toLowerCase() !== '.xml') {
    return next(new AppError('Please upload a valid WordPress XML file', 400));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'WordPress XML file uploaded successfully',
    data: {
      file: {
        filename: req.file.filename,
        size: req.file.size
      }
    }
  });
});

exports.previewWordPressImport = catchAsync(async (req, res, next) => {
  // Check if an import is already in progress
  if (importStatus.inProgress) {
    return next(new AppError('An import is already in progress. Please wait or cancel the current import.', 409));
  }
  
  // Check if file parameter is provided
  if (!req.body.filename) {
    return next(new AppError('Please provide the uploaded file name', 400));
  }
  
  const filePath = path.join(process.env.FILE_UPLOAD_PATH || 'uploads', req.body.filename);
  
  // Create WordPress import instance
  const wpImport = new WordPressImport(filePath);
  
  // Get preview
  const preview = await wpImport.getPreview();
  
  if (preview.status === 'error') {
    return next(new AppError(`Error previewing WordPress import: ${preview.message}`, 400));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      preview: preview.preview
    }
  });
});

exports.importWordPress = catchAsync(async (req, res, next) => {
  // Check if an import is already in progress
  if (importStatus.inProgress) {
    return next(new AppError('An import is already in progress. Please wait or cancel the current import.', 409));
  }
  
  // Check if file parameter is provided
  if (!req.body.filename) {
    return next(new AppError('Please provide the uploaded file name', 400));
  }
  
  const filePath = path.join(process.env.FILE_UPLOAD_PATH || 'uploads', req.body.filename);
  
  // Set import options
  const options = {
    importUsers: req.body.importUsers !== false,
    importCategories: req.body.importCategories !== false,
    importTags: req.body.importTags !== false,
    importPosts: req.body.importPosts !== false,
    importPages: req.body.importPages !== false,
    importComments: req.body.importComments !== false,
    importMedia: req.body.importMedia !== false
  };
  
  // Create WordPress import instance
  const wpImport = new WordPressImport(filePath, options);
  
  // Update import status
  importStatus.inProgress = true;
  importStatus.startTime = new Date();
  importStatus.userId = req.user.id;
  importStatus.stats = null;
  importStatus.error = null;
  
  // Start import process asynchronously
  wpImport.import(req.user.id)
    .then(result => {
      importStatus.inProgress = false;
      importStatus.endTime = new Date();
      
      if (result.status === 'error') {
        importStatus.error = result.message;
        logger.error('WordPress import failed', { error: result.message });
      } else {
        importStatus.stats = result.stats;
        logger.info('WordPress import completed', { stats: result.stats });
      }
    })
    .catch(error => {
      importStatus.inProgress = false;
      importStatus.endTime = new Date();
      importStatus.error = error.message;
      logger.error('WordPress import failed with exception', { error });
    });
  
  res.status(202).json({
    status: 'success',
    message: 'WordPress import started',
    data: {
      importStatus: {
        inProgress: true,
        startTime: importStatus.startTime
      }
    }
  });
});

exports.getImportStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      importStatus: {
        inProgress: importStatus.inProgress,
        startTime: importStatus.startTime,
        endTime: importStatus.endTime,
        userId: importStatus.userId,
        stats: importStatus.stats,
        error: importStatus.error
      }
    }
  });
});

exports.cancelImport = catchAsync(async (req, res, next) => {
  // Check if import is in progress and initiated by the same user or admin
  if (
    !importStatus.inProgress || 
    (importStatus.userId !== req.user.id && req.user.role !== 'admin')
  ) {
    return next(new AppError('No import in progress or you do not have permission to cancel it', 400));
  }
  
  // Update import status
  importStatus.inProgress = false;
  importStatus.endTime = new Date();
  importStatus.error = 'Import cancelled by user';
  
  logger.info('WordPress import cancelled', { 
    userId: req.user.id,
    startTime: importStatus.startTime,
    endTime: importStatus.endTime
  });
  
  res.status(200).json({
    status: 'success',
    message: 'WordPress import cancelled',
    data: {
      importStatus: {
        inProgress: false,
        startTime: importStatus.startTime,
        endTime: importStatus.endTime,
        error: 'Import cancelled by user'
      }
    }
  });
});