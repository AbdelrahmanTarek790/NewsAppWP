const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Create an in-memory cache for posts
const postCache = {
  cache: new Map(),
  ttl: 5 * 60 * 1000, // 5 minutes
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  },
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  invalidate(key) {
    this.cache.delete(key);
  },
  
  clear() {
    this.cache.clear();
  }
};

exports.getAllPosts = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { status: 'published' };
  
  // Filter by category if provided
  if (req.query.category) {
    queryObj.categories = req.query.category;
  }
  
  // Filter by tag if provided
  if (req.query.tag) {
    queryObj.tags = req.query.tag;
  }
  
  // Filter by author if provided
  if (req.query.author) {
    queryObj.author = req.query.author;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Sorting
  const sortBy = req.query.sort || '-publishedAt';
  
  // Check cache for this specific query
  const cacheKey = `posts:${JSON.stringify(queryObj)}:${page}:${limit}:${sortBy}`;
  const cachedResult = postCache.get(cacheKey);
  
  if (cachedResult) {
    return res.status(200).json(cachedResult);
  }
  
  // Execute query
  const posts = await Post.find(queryObj)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Post.countDocuments(queryObj);
  
  const result = {
    status: 'success',
    results: posts.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      posts
    }
  };
  
  // Cache the result
  postCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.getFeaturedPosts = catchAsync(async (req, res, next) => {
  const cacheKey = 'posts:featured';
  const cachedResult = postCache.get(cacheKey);
  
  if (cachedResult) {
    return res.status(200).json(cachedResult);
  }
  
  const posts = await Post.find({ 
    status: 'published',
    featured: true 
  }).sort('-publishedAt').limit(6);
  
  const result = {
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  };
  
  postCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.getTrendingPosts = catchAsync(async (req, res, next) => {
  const cacheKey = 'posts:trending';
  const cachedResult = postCache.get(cacheKey);
  
  if (cachedResult) {
    return res.status(200).json(cachedResult);
  }
  
  const posts = await Post.find({ 
    status: 'published',
    trending: true 
  }).sort('-publishedAt').limit(6);
  
  const result = {
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  };
  
  postCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.searchPosts = catchAsync(async (req, res, next) => {
  if (!req.query.q) {
    return next(new AppError('Please provide a search query', 400));
  }
  
  const searchQuery = req.query.q;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  const posts = await Post.find({ 
    status: 'published',
    $text: { $search: searchQuery } 
  }, {
    score: { $meta: 'textScore' }
  })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
  
  const total = await Post.countDocuments({ 
    status: 'published',
    $text: { $search: searchQuery } 
  });
  
  res.status(200).json({
    status: 'success',
    results: posts.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      posts
    }
  });
});

exports.getPostBySlug = catchAsync(async (req, res, next) => {
  const cacheKey = `post:${req.params.slug}`;
  const cachedResult = postCache.get(cacheKey);
  
  if (cachedResult) {
    // Increment view count asynchronously without waiting
    Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { viewCount: 1 } }
    ).exec();
    
    return res.status(200).json(cachedResult);
  }
  
  const post = await Post.findOne({ 
    slug: req.params.slug,
    status: 'published'
  }).populate({
    path: 'comments',
    match: { status: 'approved', parent: null },
    options: { sort: { createdAt: -1 } }
  });
  
  if (!post) {
    return next(new AppError('No post found with that slug', 404));
  }
  
  // Increment view count
  post.viewCount += 1;
  await post.save({ validateBeforeSave: false });
  
  const result = {
    status: 'success',
    data: {
      post
    }
  };
  
  postCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ 
    author: req.user.id,
    status: 'published'
  }).sort('-publishedAt');
  
  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
});

exports.getMyDrafts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ 
    author: req.user.id,
    status: { $in: ['draft', 'scheduled'] }
  }).sort('-updatedAt');
  
  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  // Add author and handle scheduled posts
  const postData = {
    ...req.body,
    author: req.user.id,
    updatedBy: req.user.id
  };
  
  // Set scheduled status if date is in the future
  if (req.body.scheduledFor && new Date(req.body.scheduledFor) > new Date()) {
    postData.status = 'scheduled';
  }
  
  const newPost = await Post.create(postData);
  
  // Clear any cached data that might include posts
  postCache.clear();
  
  logger.info('Post created', { 
    id: newPost._id, 
    title: newPost.title,
    author: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  // Find post
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  
  // Check if user is the author or has editor/admin role
  if (
    post.author.id !== req.user.id && 
    !['editor', 'admin'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to update this post', 403));
  }
  
  // Add updatedBy
  req.body.updatedBy = req.user.id;
  
  // Handle scheduling
  if (req.body.scheduledFor && new Date(req.body.scheduledFor) > new Date()) {
    req.body.status = 'scheduled';
  }
  
  // Update post
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Clear cache
  postCache.clear();
  postCache.invalidate(`post:${updatedPost.slug}`);
  
  logger.info('Post updated', { 
    id: updatedPost._id, 
    title: updatedPost.title,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
    }
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  
  // Check if user is the author or has admin role
  if (
    post.author.id !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    return next(new AppError('You do not have permission to delete this post', 403));
  }
  
  await Post.findByIdAndDelete(req.params.id);
  
  // Clear cache
  postCache.clear();
  postCache.invalidate(`post:${post.slug}`);
  
  logger.info('Post deleted', { 
    id: post._id, 
    title: post.title,
    deletedBy: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updatePostStatus = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  
  // Check if user is the author or has editor/admin role
  if (
    post.author.id !== req.user.id && 
    !['editor', 'admin'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to update this post status', 403));
  }
  
  const updateData = {
    status: req.body.status,
    updatedBy: req.user.id
  };
  
  // Handle publishing
  if (req.body.status === 'published') {
    updateData.publishedAt = Date.now();
    updateData.scheduledFor = undefined;
  }
  
  // Handle scheduling
  if (req.body.status === 'scheduled') {
    if (!req.body.scheduledFor) {
      return next(new AppError('Scheduled date is required for scheduled posts', 400));
    }
    
    updateData.scheduledFor = req.body.scheduledFor;
    updateData.publishedAt = undefined;
  }
  
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });
  
  // Clear cache
  postCache.clear();
  postCache.invalidate(`post:${updatedPost.slug}`);
  
  logger.info('Post status updated', { 
    id: updatedPost._id, 
    title: updatedPost.title,
    status: updatedPost.status,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
    }
  });
});