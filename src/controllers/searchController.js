const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Post = require('../models/postModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');

exports.search = catchAsync(async (req, res, next) => {
  if (!req.query.q) {
    return next(new AppError('Please provide a search query', 400));
  }
  
  const searchQuery = req.query.q;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Search in posts
  const posts = await Post.find({ 
    status: 'published',
    $text: { $search: searchQuery } 
  }, {
    score: { $meta: 'textScore' }
  })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
  
  // Search in categories
  const categories = await Category.find({
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } }
    ]
  }).limit(3);
  
  // Search in users
  const users = await User.find({
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { username: { $regex: searchQuery, $options: 'i' } },
      { bio: { $regex: searchQuery, $options: 'i' } }
    ],
    role: { $in: ['author', 'editor'] } // Only public roles
  }).select('name username photo bio').limit(3);
  
  // Count for the most relevant type
  const postsCount = await Post.countDocuments({ 
    status: 'published',
    $text: { $search: searchQuery } 
  });
  
  const categoriesCount = await Category.countDocuments({
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } }
    ]
  });
  
  const usersCount = await User.countDocuments({
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { username: { $regex: searchQuery, $options: 'i' } },
      { bio: { $regex: searchQuery, $options: 'i' } }
    ],
    role: { $in: ['author', 'editor'] }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      query: searchQuery,
      results: {
        posts,
        postsCount,
        categories,
        categoriesCount,
        users,
        usersCount
      }
    }
  });
});

exports.getSuggestions = catchAsync(async (req, res, next) => {
  if (!req.query.q) {
    return next(new AppError('Please provide a search query', 400));
  }
  
  const searchQuery = req.query.q;
  
  // Get post title suggestions
  const postSuggestions = await Post.find({
    title: { $regex: searchQuery, $options: 'i' },
    status: 'published'
  }).select('title slug').limit(5);
  
  // Get category suggestions
  const categorySuggestions = await Category.find({
    name: { $regex: searchQuery, $options: 'i' }
  }).select('name slug').limit(3);
  
  // Get tag suggestions
  const tagSuggestions = await Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $match: { tags: { $regex: searchQuery, $options: 'i' } } },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      query: searchQuery,
      suggestions: {
        posts: postSuggestions,
        categories: categorySuggestions,
        tags: tagSuggestions.map(tag => ({ tag: tag._id, count: tag.count }))
      }
    }
  });
});

exports.advancedSearch = catchAsync(async (req, res, next) => {
  // Build query
  const query = { status: 'published' };
  
  // Add text search if query provided
  if (req.query.q) {
    query.$text = { $search: req.query.q };
  }
  
  // Filter by category
  if (req.query.category) {
    query.categories = req.query.category;
  }
  
  // Filter by tag
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  
  // Filter by author
  if (req.query.author) {
    query.author = req.query.author;
  }
  
  // Filter by date range
  if (req.query.from || req.query.to) {
    query.publishedAt = {};
    
    if (req.query.from) {
      query.publishedAt.$gte = new Date(req.query.from);
    }
    
    if (req.query.to) {
      query.publishedAt.$lte = new Date(req.query.to);
    }
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Sorting
  let sortBy = {};
  
  if (req.query.q) {
    // If text search, sort by score
    sortBy = { score: { $meta: 'textScore' } };
  } else if (req.query.sort) {
    // User-provided sort
    const sortField = req.query.sort.startsWith('-') 
      ? req.query.sort.substring(1) 
      : req.query.sort;
    const sortDirection = req.query.sort.startsWith('-') ? -1 : 1;
    sortBy[sortField] = sortDirection;
  } else {
    // Default sort
    sortBy = { publishedAt: -1 };
  }
  
  // Execute query with projection
  const posts = await Post.find(
    query,
    req.query.q ? { score: { $meta: 'textScore' } } : {}
  )
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Post.countDocuments(query);
  
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