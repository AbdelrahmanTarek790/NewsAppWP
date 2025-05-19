const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const Media = require('../models/mediaModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Process image and create thumbnails
const processImage = async (file) => {
  try {
    // Get image info
    const metadata = await sharp(file.path).metadata();
    
    // Create thumbnails directory if it doesn't exist
    const thumbnailsDir = path.join(process.env.FILE_UPLOAD_PATH || 'uploads', 'thumbnails');
    try {
      await fs.access(thumbnailsDir);
    } catch (err) {
      await fs.mkdir(thumbnailsDir, { recursive: true });
    }
    
    // Generate thumbnails
    const thumbnails = {};
    const sizes = { small: 300, medium: 600, large: 1200 };
    
    for (const [size, width] of Object.entries(sizes)) {
      const thumbnailFilename = `${size}_${file.filename}`;
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
      
      await sharp(file.path)
        .resize({ width, withoutEnlargement: true })
        .toFile(thumbnailPath);
      
      thumbnails[size] = `/uploads/thumbnails/${thumbnailFilename}`;
    }
    
    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      thumbnails
    };
  } catch (error) {
    logger.error('Error processing image', { error });
    throw new AppError('Error processing image', 500);
  }
};

exports.getAllMedia = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = {};
  
  // Filter by uploader if requested
  if (req.query.uploader) {
    queryObj.uploadedBy = req.query.uploader;
  } else if (!['admin', 'editor'].includes(req.user.role)) {
    // Non-admin users can only see their own media
    queryObj.uploadedBy = req.user.id;
  }
  
  // Filter by mime type if requested
  if (req.query.type) {
    if (req.query.type === 'image') {
      queryObj.mimeType = { $regex: '^image/' };
    } else if (req.query.type === 'document') {
      queryObj.mimeType = { $regex: '^application/' };
    } else if (req.query.type === 'video') {
      queryObj.mimeType = { $regex: '^video/' };
    }
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  // Sorting
  const sortBy = req.query.sort || '-createdAt';
  
  // Execute query
  const media = await Media.find(queryObj)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Media.countDocuments(queryObj);
  
  res.status(200).json({
    status: 'success',
    results: media.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      media
    }
  });
});

exports.getMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  
  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }
  
  // Check if user has access to this media
  if (
    media.uploadedBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to access this media', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      media
    }
  });
});

exports.uploadMedia = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }
  
  const file = req.file;
  const fileUrl = `/uploads/${file.filename}`;
  
  // Process image if it's an image
  let imageData = {};
  if (file.mimetype.startsWith('image/')) {
    imageData = await processImage(file);
  }
  
  // Create media record
  const media = await Media.create({
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: fileUrl,
    alt: req.body.alt || file.originalname,
    title: req.body.title || '',
    caption: req.body.caption || '',
    description: req.body.description || '',
    dimensions: imageData.dimensions || {},
    thumbnails: imageData.thumbnails || {},
    uploadedBy: req.user.id
  });
  
  logger.info('Media uploaded', { 
    id: media._id, 
    filename: media.fileName,
    uploader: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      media
    }
  });
});

exports.updateMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  
  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }
  
  // Check if user has permission to update this media
  if (
    media.uploadedBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to update this media', 403));
  }
  
  // Update only allowed fields
  const updates = {
    alt: req.body.alt,
    title: req.body.title,
    caption: req.body.caption,
    description: req.body.description
  };
  
  Object.keys(updates).forEach(key => {
    if (updates[key] === undefined) delete updates[key];
  });
  
  const updatedMedia = await Media.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });
  
  logger.info('Media updated', { 
    id: updatedMedia._id, 
    updater: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      media: updatedMedia
    }
  });
});

exports.deleteMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  
  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }
  
  // Check if user has permission to delete this media
  if (
    media.uploadedBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to delete this media', 403));
  }
  
  // Delete from database
  await Media.findByIdAndDelete(req.params.id);
  
  // Delete physical files
  try {
    const filePath = path.join(process.env.FILE_UPLOAD_PATH || 'uploads', media.fileName);
    await fs.unlink(filePath);
    
    // Delete thumbnails if they exist
    if (media.thumbnails) {
      for (const size of ['small', 'medium', 'large']) {
        if (media.thumbnails[size]) {
          const thumbnailFile = path.basename(media.thumbnails[size]);
          const thumbnailPath = path.join(
            process.env.FILE_UPLOAD_PATH || 'uploads', 
            'thumbnails',
            thumbnailFile
          );
          await fs.unlink(thumbnailPath).catch(() => {});
        }
      }
    }
  } catch (error) {
    logger.error('Error deleting media files', { error });
    // Continue even if file deletion fails
  }
  
  logger.info('Media deleted', { 
    id: media._id, 
    filename: media.fileName,
    deleter: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.searchMedia = catchAsync(async (req, res, next) => {
  if (!req.query.q) {
    return next(new AppError('Please provide a search query', 400));
  }
  
  const searchQuery = req.query.q;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  // Build query
  const query = {
    $or: [
      { originalName: { $regex: searchQuery, $options: 'i' } },
      { alt: { $regex: searchQuery, $options: 'i' } },
      { title: { $regex: searchQuery, $options: 'i' } },
      { caption: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } }
    ]
  };
  
  // Restrict to user's own media for non-admin/editor users
  if (!['admin', 'editor'].includes(req.user.role)) {
    query.uploadedBy = req.user.id;
  }
  
  // Execute query
  const media = await Media.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Media.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: media.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      media
    }
  });
});

exports.uploadMultipleMedia = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one file', 400));
  }
  
  const mediaPromises = req.files.map(async (file) => {
    const fileUrl = `/uploads/${file.filename}`;
    
    // Process image if it's an image
    let imageData = {};
    if (file.mimetype.startsWith('image/')) {
      imageData = await processImage(file);
    }
    
    // Create media record
    return Media.create({
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      alt: file.originalname,
      dimensions: imageData.dimensions || {},
      thumbnails: imageData.thumbnails || {},
      uploadedBy: req.user.id
    });
  });
  
  const mediaItems = await Promise.all(mediaPromises);
  
  logger.info('Multiple media uploaded', { 
    count: mediaItems.length,
    uploader: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    results: mediaItems.length,
    data: {
      media: mediaItems
    }
  });
});

exports.deleteMultipleMedia = catchAsync(async (req, res, next) => {
  if (!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
    return next(new AppError('Please provide an array of media IDs to delete', 400));
  }
  
  const mediaIds = req.body.ids;
  
  // Check if user has permission to delete these items
  const mediaItems = await Media.find({ _id: { $in: mediaIds } });
  
  // Check permissions
  if (!['admin', 'editor'].includes(req.user.role)) {
    const notOwnedMedia = mediaItems.filter(media => 
      media.uploadedBy.toString() !== req.user.id
    );
    
    if (notOwnedMedia.length > 0) {
      return next(new AppError('You do not have permission to delete some of these media items', 403));
    }
  }
  
  // Delete from database
  await Media.deleteMany({ _id: { $in: mediaIds } });
  
  // Delete physical files
  for (const media of mediaItems) {
    try {
      const filePath = path.join(process.env.FILE_UPLOAD_PATH || 'uploads', media.fileName);
      await fs.unlink(filePath).catch(() => {});
      
      // Delete thumbnails if they exist
      if (media.thumbnails) {
        for (const size of ['small', 'medium', 'large']) {
          if (media.thumbnails[size]) {
            const thumbnailFile = path.basename(media.thumbnails[size]);
            const thumbnailPath = path.join(
              process.env.FILE_UPLOAD_PATH || 'uploads', 
              'thumbnails',
              thumbnailFile
            );
            await fs.unlink(thumbnailPath).catch(() => {});
          }
        }
      }
    } catch (error) {
      logger.error('Error deleting media files', { error });
      // Continue even if file deletion fails
    }
  }
  
  logger.info('Multiple media deleted', { 
    count: mediaIds.length,
    deleter: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});