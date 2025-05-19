const Category = require('../models/categoryModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Cache for categories
const categoryCache = {
  cache: new Map(),
  ttl: 10 * 60 * 1000, // 10 minutes
  
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

exports.getAllCategories = catchAsync(async (req, res, next) => {
  // Check cache
  const cacheKey = 'categories:all';
  const cachedData = categoryCache.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json(cachedData);
  }
  
  // Get all root categories (those without a parent)
  const rootCategories = await Category.find({ parent: null })
    .sort('order')
    .populate('subcategories');
  
  const result = {
    status: 'success',
    results: rootCategories.length,
    data: {
      categories: rootCategories
    }
  };
  
  // Cache the result
  categoryCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.getFeaturedCategories = catchAsync(async (req, res, next) => {
  // Check cache
  const cacheKey = 'categories:featured';
  const cachedData = categoryCache.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json(cachedData);
  }
  
  // Get featured categories
  const categories = await Category.find({ featured: true })
    .sort('order')
    .populate('image');
  
  const result = {
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  };
  
  // Cache the result
  categoryCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  // Check cache
  const cacheKey = `category:${req.params.slug}`;
  const cachedData = categoryCache.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json(cachedData);
  }
  
  // Get category by slug
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('subcategories')
    .populate('image');
  
  if (!category) {
    return next(new AppError('No category found with that slug', 404));
  }
  
  const result = {
    status: 'success',
    data: {
      category
    }
  };
  
  // Cache the result
  categoryCache.set(cacheKey, result);
  
  res.status(200).json(result);
});

exports.getPostsByCategory = catchAsync(async (req, res, next) => {
  // Find category by slug
  const category = await Category.findOne({ slug: req.params.slug });
  
  if (!category) {
    return next(new AppError('No category found with that slug', 404));
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Get all subcategories to include in query
  let subcategoryIds = [];
  if (req.query.includeSubcategories !== 'false') {
    const subcategories = await Category.find({ parent: category._id });
    subcategoryIds = subcategories.map(subcat => subcat._id);
  }
  
  const categoryIds = [category._id, ...subcategoryIds];
  
  // Get posts in the category
  const posts = await Post.find({
    categories: { $in: categoryIds },
    status: 'published'
  })
    .sort(req.query.sort || '-publishedAt')
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Post.countDocuments({
    categories: { $in: categoryIds },
    status: 'published'
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
      category,
      posts
    }
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  // Check if parent category exists if provided
  if (req.body.parent) {
    const parentCategory = await Category.findById(req.body.parent);
    
    if (!parentCategory) {
      return next(new AppError('No parent category found with that ID', 404));
    }
  }
  
  // Create new category
  const newCategory = await Category.create(req.body);
  
  // Clear cache
  categoryCache.clear();
  
  logger.info('Category created', { 
    id: newCategory._id, 
    name: newCategory.name,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory
    }
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  // Check if parent creates a cycle (a category can't be its own ancestor)
  if (req.body.parent) {
    let currentParent = req.body.parent;
    const visitedParents = new Set([req.params.id]);
    
    while (currentParent) {
      // If we've already seen this parent, we have a cycle
      if (visitedParents.has(currentParent.toString())) {
        return next(new AppError('Parent category would create a cycle', 400));
      }
      
      visitedParents.add(currentParent.toString());
      
      // Get the next parent
      const parentCategory = await Category.findById(currentParent);
      currentParent = parentCategory ? parentCategory.parent : null;
    }
  }
  
  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  // Clear cache
  categoryCache.clear();
  
  logger.info('Category updated', { 
    id: updatedCategory._id, 
    name: updatedCategory.name,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      category: updatedCategory
    }
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  
  // Check if category has subcategories
  const subcategories = await Category.countDocuments({ parent: category._id });
  
  if (subcategories > 0) {
    return next(new AppError('Cannot delete a category with subcategories', 400));
  }
  
  // Check if category is used in posts
  const posts = await Post.countDocuments({ categories: category._id });
  
  if (posts > 0) {
    return next(new AppError('Cannot delete a category that is used in posts', 400));
  }
  
  await Category.findByIdAndDelete(req.params.id);
  
  // Clear cache
  categoryCache.clear();
  
  logger.info('Category deleted', { 
    id: category._id, 
    name: category.name,
    deletedBy: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});