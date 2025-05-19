const Distribution = require('../models/distributionModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');

// Utility to prepare distribution data
const prepareDistributionData = (data, userId) => {
  return {
    ...data,
    createdBy: userId
  };
};

exports.getAllDistributions = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = {};
  
  // Filter by status if provided
  if (req.query.status) {
    queryObj.status = req.query.status;
  }
  
  // Filter by channel if provided
  if (req.query.channel) {
    queryObj.channel = req.query.channel;
  }
  
  // Filter by content if provided
  if (req.query.content) {
    queryObj.content = req.query.content;
  }
  
  // Filter by creator if provided or restrict to user's own if not admin/editor
  if (req.query.createdBy) {
    queryObj.createdBy = req.query.createdBy;
  } else if (!['admin', 'editor'].includes(req.user.role)) {
    queryObj.createdBy = req.user.id;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Sorting
  const sortBy = req.query.sort || '-scheduledFor';
  
  // Execute query
  const distributions = await Distribution.find(queryObj)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Distribution.countDocuments(queryObj);
  
  res.status(200).json({
    status: 'success',
    results: distributions.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      distributions
    }
  });
});

exports.getDistribution = catchAsync(async (req, res, next) => {
  const distribution = await Distribution.findById(req.params.id);
  
  if (!distribution) {
    return next(new AppError('No distribution found with that ID', 404));
  }
  
  // Check if user has access to this distribution
  if (
    distribution.createdBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to view this distribution', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      distribution
    }
  });
});

exports.createDistribution = catchAsync(async (req, res, next) => {
  // Check if content exists
  const post = await Post.findById(req.body.content);
  if (!post) {
    return next(new AppError('No content found with that ID', 404));
  }
  
  // Prepare distribution data
  const distributionData = prepareDistributionData(req.body, req.user.id);
  
  // Create distribution
  const newDistribution = await Distribution.create(distributionData);
  
  logger.info('Distribution created', { 
    id: newDistribution._id, 
    title: newDistribution.title,
    channel: newDistribution.channel,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      distribution: newDistribution
    }
  });
});

exports.scheduleSocialPost = catchAsync(async (req, res, next) => {
  // Check if content exists
  const post = await Post.findById(req.body.content);
  if (!post) {
    return next(new AppError('No content found with that ID', 404));
  }
  
  // Add channel prefix if needed
  let channel = req.body.channel;
  if (!channel.startsWith('social-')) {
    channel = `social-${channel}`;
  }
  
  // Prepare distribution data
  const distributionData = prepareDistributionData({
    ...req.body,
    channel
  }, req.user.id);
  
  // Create distribution
  const newDistribution = await Distribution.create(distributionData);
  
  logger.info('Social post scheduled', { 
    id: newDistribution._id, 
    title: newDistribution.title,
    channel: newDistribution.channel,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      distribution: newDistribution
    }
  });
});

exports.scheduleEmailNewsletter = catchAsync(async (req, res, next) => {
  // Check if content exists
  const post = await Post.findById(req.body.content);
  if (!post) {
    return next(new AppError('No content found with that ID', 404));
  }
  
  // Prepare distribution data
  const distributionData = prepareDistributionData({
    ...req.body,
    channel: 'email-newsletter',
    metadata: {
      customFields: {
        subject: req.body.subject,
        template: req.body.template || 'default'
      }
    }
  }, req.user.id);
  
  // Create distribution
  const newDistribution = await Distribution.create(distributionData);
  
  logger.info('Email newsletter scheduled', { 
    id: newDistribution._id, 
    title: newDistribution.title,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      distribution: newDistribution
    }
  });
});

exports.schedulePushNotification = catchAsync(async (req, res, next) => {
  // Check if content exists
  const post = await Post.findById(req.body.content);
  if (!post) {
    return next(new AppError('No content found with that ID', 404));
  }
  
  // Prepare distribution data
  const distributionData = prepareDistributionData({
    ...req.body,
    channel: 'push-notification'
  }, req.user.id);
  
  // Create distribution
  const newDistribution = await Distribution.create(distributionData);
  
  logger.info('Push notification scheduled', { 
    id: newDistribution._id, 
    title: newDistribution.title,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      distribution: newDistribution
    }
  });
});

exports.updateDistribution = catchAsync(async (req, res, next) => {
  // Find distribution
  const distribution = await Distribution.findById(req.params.id);
  
  if (!distribution) {
    return next(new AppError('No distribution found with that ID', 404));
  }
  
  // Check if distribution is already sent
  if (distribution.status === 'sent') {
    return next(new AppError('Cannot update a distribution that has already been sent', 400));
  }
  
  // Check if user has access to update this distribution
  if (
    distribution.createdBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to update this distribution', 403));
  }
  
  // Update the distribution
  const updatedDistribution = await Distribution.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  logger.info('Distribution updated', { 
    id: updatedDistribution._id, 
    title: updatedDistribution.title,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      distribution: updatedDistribution
    }
  });
});

exports.updateDistributionStatus = catchAsync(async (req, res, next) => {
  // Find distribution
  const distribution = await Distribution.findById(req.params.id);
  
  if (!distribution) {
    return next(new AppError('No distribution found with that ID', 404));
  }
  
  // Check if user has access to update this distribution
  if (
    distribution.createdBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to update this distribution', 403));
  }
  
  // Update status
  const updateData = { status: req.body.status };
  
  // If marking as sent, update the lastSentAt
  if (req.body.status === 'sent') {
    updateData.lastSentAt = Date.now();
  }
  
  const updatedDistribution = await Distribution.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });
  
  logger.info('Distribution status updated', { 
    id: updatedDistribution._id, 
    title: updatedDistribution.title,
    status: updatedDistribution.status,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      distribution: updatedDistribution
    }
  });
});

exports.deleteDistribution = catchAsync(async (req, res, next) => {
  // Find distribution
  const distribution = await Distribution.findById(req.params.id);
  
  if (!distribution) {
    return next(new AppError('No distribution found with that ID', 404));
  }
  
  // Check if distribution is already sent
  if (distribution.status === 'sent') {
    return next(new AppError('Cannot delete a distribution that has already been sent', 400));
  }
  
  // Check if user has access to delete this distribution
  if (
    distribution.createdBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to delete this distribution', 403));
  }
  
  await Distribution.findByIdAndDelete(req.params.id);
  
  logger.info('Distribution deleted', { 
    id: distribution._id, 
    title: distribution.title,
    deletedBy: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.executeDistribution = catchAsync(async (req, res, next) => {
  // Find distribution
  const distribution = await Distribution.findById(req.params.id);
  
  if (!distribution) {
    return next(new AppError('No distribution found with that ID', 404));
  }
  
  // Check if user has access to execute this distribution
  if (
    distribution.createdBy.id !== req.user.id && 
    !['admin', 'editor'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to execute this distribution', 403));
  }
  
  // Check if it's already sent
  if (distribution.status === 'sent') {
    return next(new AppError('This distribution has already been sent', 400));
  }
  
  try {
    // Execute the distribution based on the channel
    if (distribution.channel === 'email-newsletter') {
      // Get the post content
      const post = await Post.findById(distribution.content);
      
      // This would actually send to all subscribers in a real implementation
      // For demo purposes, we'll just log it
      logger.info('Email newsletter executed', {
        id: distribution._id,
        title: distribution.title,
        postTitle: post.title,
        executedBy: req.user.id
      });
      
      // For demo, send email to the creator
      await sendEmail({
        email: req.user.email,
        subject: `Newsletter: ${distribution.title}`,
        message: `Your newsletter "${distribution.title}" was sent successfully. It featured the post "${post.title}".`,
        template: 'newsletter',
        templateData: {
          title: distribution.title,
          postTitle: post.title,
          postLink: `${req.protocol}://${req.get('host')}/posts/${post.slug}`,
          content: post.content
        }
      });
    } else if (distribution.channel.startsWith('social-')) {
      // This would integrate with social media APIs in a real implementation
      // For demo, just log it
      logger.info(`${distribution.channel} post executed`, {
        id: distribution._id,
        title: distribution.title,
        executedBy: req.user.id
      });
    } else if (distribution.channel === 'push-notification') {
      // This would send push notifications in a real implementation
      // For demo, just log it
      logger.info('Push notification executed', {
        id: distribution._id,
        title: distribution.title,
        executedBy: req.user.id
      });
    }
    
    // Update status to sent
    distribution.status = 'sent';
    distribution.lastSentAt = Date.now();
    await distribution.save();
    
    res.status(200).json({
      status: 'success',
      message: `Distribution "${distribution.title}" executed successfully`,
      data: {
        distribution
      }
    });
  } catch (error) {
    // Update status to failed
    distribution.status = 'failed';
    await distribution.save();
    
    logger.error('Distribution execution failed', {
      id: distribution._id,
      title: distribution.title,
      error: error.message
    });
    
    return next(new AppError(`Failed to execute distribution: ${error.message}`, 500));
  }
});

exports.getDistributionCalendar = catchAsync(async (req, res, next) => {
  // Get date range from query params or default to current month
  const now = new Date();
  const startDate = req.query.start ? new Date(req.query.start) : new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = req.query.end ? new Date(req.query.end) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Query distributions within the date range
  const queryObj = {
    scheduledFor: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  // Restrict to user's own distributions if not admin/editor
  if (!['admin', 'editor'].includes(req.user.role)) {
    queryObj.createdBy = req.user.id;
  }
  
  const distributions = await Distribution.find(queryObj)
    .sort('scheduledFor')
    .populate({
      path: 'content',
      select: 'title slug'
    });
  
  // Format for calendar
  const calendarEvents = distributions.map(dist => ({
    id: dist._id,
    title: dist.title,
    start: dist.scheduledFor,
    end: new Date(new Date(dist.scheduledFor).getTime() + 30 * 60000), // Add 30 minutes for display
    status: dist.status,
    channel: dist.channel,
    content: {
      id: dist.content._id,
      title: dist.content.title,
      slug: dist.content.slug
    }
  }));
  
  res.status(200).json({
    status: 'success',
    data: {
      calendarEvents
    }
  });
});

exports.getDistributionAnalytics = catchAsync(async (req, res, next) => {
  // Get date range from query params or default to last 30 days
  const now = new Date();
  const endDate = now;
  const startDate = req.query.start ? 
    new Date(req.query.start) : 
    new Date(now.setDate(now.getDate() - 30));
  
  // Build pipeline to aggregate analytics
  const pipeline = [
    {
      $match: {
        lastSentAt: { $gte: startDate, $lte: endDate },
        status: 'sent'
      }
    },
    {
      $group: {
        _id: {
          channel: '$channel',
          day: { $dateToString: { format: '%Y-%m-%d', date: '$lastSentAt' } }
        },
        count: { $sum: 1 },
        opens: { $sum: '$metrics.opens' },
        clicks: { $sum: '$metrics.clicks' },
        shares: { $sum: '$metrics.shares' },
        likes: { $sum: '$metrics.likes' },
        comments: { $sum: '$metrics.comments' }
      }
    },
    {
      $sort: { '_id.day': 1 }
    }
  ];
  
  // Restrict to user's own distributions if not admin/editor
  if (!['admin', 'editor'].includes(req.user.role)) {
    pipeline[0].$match.createdBy = mongoose.Types.ObjectId(req.user.id);
  }
  
  const analytics = await Distribution.aggregate(pipeline);
  
  // Also get channel totals
  const channelTotals = await Distribution.aggregate([
    {
      $match: {
        lastSentAt: { $gte: startDate, $lte: endDate },
        status: 'sent'
      }
    },
    {
      $group: {
        _id: '$channel',
        count: { $sum: 1 },
        opens: { $sum: '$metrics.opens' },
        clicks: { $sum: '$metrics.clicks' },
        shares: { $sum: '$metrics.shares' },
        likes: { $sum: '$metrics.likes' },
        comments: { $sum: '$metrics.comments' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      timeRange: {
        start: startDate,
        end: endDate
      },
      dailyAnalytics: analytics,
      channelTotals
    }
  });
});

exports.getAvailableChannels = catchAsync(async (req, res, next) => {
  const channels = [
    {
      id: 'social-twitter',
      name: 'Twitter',
      type: 'social',
      icon: 'twitter',
      description: 'Share content on Twitter',
      maxLength: 280,
      allowsMedia: true
    },
    {
      id: 'social-facebook',
      name: 'Facebook',
      type: 'social',
      icon: 'facebook',
      description: 'Share content on Facebook',
      maxLength: null,
      allowsMedia: true
    },
    {
      id: 'social-linkedin',
      name: 'LinkedIn',
      type: 'social',
      icon: 'linkedin',
      description: 'Share content on LinkedIn',
      maxLength: null,
      allowsMedia: true
    },
    {
      id: 'social-instagram',
      name: 'Instagram',
      type: 'social',
      icon: 'instagram',
      description: 'Share content on Instagram',
      maxLength: null,
      allowsMedia: true,
      requiresMedia: true
    },
    {
      id: 'email-newsletter',
      name: 'Email Newsletter',
      type: 'email',
      icon: 'email',
      description: 'Send an email newsletter to subscribers',
      maxLength: null,
      allowsMedia: true,
      templates: ['default', 'minimal', 'featured']
    },
    {
      id: 'push-notification',
      name: 'Push Notification',
      type: 'push',
      icon: 'notifications',
      description: 'Send a push notification to app users',
      maxLength: 200,
      allowsMedia: false
    }
  ];
  
  res.status(200).json({
    status: 'success',
    data: {
      channels
    }
  });
});