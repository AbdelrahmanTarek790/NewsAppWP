const User = require('../models/userModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Filter allowed fields for updating user
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if password is being updated
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password.',
        400
      )
    );
  }
  
  // 2) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'username', 'bio', 'photo', 'socialMedia');
  
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  logger.info('User updated their profile', { 
    id: updatedUser._id,
    username: updatedUser.username
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  
  logger.info('User deactivated their account', { 
    id: req.user.id,
    username: req.user.username
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  
  logger.info('Admin created new user', { 
    id: newUser._id,
    username: newUser.username,
    createdBy: req.user.id
  });
  
  // Remove password from output
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Filter out password fields
  const filteredBody = { ...req.body };
  delete filteredBody.password;
  delete filteredBody.passwordConfirm;
  
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  logger.info('Admin updated user', { 
    id: updatedUser._id,
    username: updatedUser.username,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  logger.info('Admin updated user role', { 
    id: updatedUser._id,
    username: updatedUser.username,
    newRole: updatedUser.role,
    updatedBy: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  logger.info('Admin deleted user', { 
    id: user._id,
    username: user.username,
    deletedBy: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getPublicAuthors = catchAsync(async (req, res, next) => {
  const authors = await User.find({
    role: { $in: ['author', 'editor'] },
    active: true
  }).select('name username photo bio socialMedia');
  
  res.status(200).json({
    status: 'success',
    results: authors.length,
    data: {
      authors
    }
  });
});

exports.getPublicAuthorProfile = catchAsync(async (req, res, next) => {
  const author = await User.findOne({ 
    username: req.params.username,
    role: { $in: ['author', 'editor'] },
    active: true
  }).select('name username photo bio socialMedia');
  
  if (!author) {
    return next(new AppError('No author found with that username', 404));
  }
  
  // Get author's published posts
  const posts = await Post.find({
    author: author._id,
    status: 'published'
  }).sort('-publishedAt').limit(10);
  
  res.status(200).json({
    status: 'success',
    data: {
      author,
      posts
    }
  });
});