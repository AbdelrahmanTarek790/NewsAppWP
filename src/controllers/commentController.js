const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

exports.getCommentsByPost = catchAsync(async (req, res, next) => {
  // Check if post exists
  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  
  // Get approved comments for the post
  const comments = await Comment.find({
    post: req.params.postId,
    status: 'approved',
    parent: null // Get only root comments
  }).sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments
    }
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  // Check if post exists
  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  
  // Check if parent comment exists if provided
  if (req.body.parent) {
    const parentComment = await Comment.findById(req.body.parent);
    
    if (!parentComment) {
      return next(new AppError('No parent comment found with that ID', 404));
    }
    
    // Ensure parent comment is for the same post
    if (parentComment.post.toString() !== req.params.postId) {
      return next(new AppError('Parent comment does not belong to this post', 400));
    }
  }
  
  // Auto-approve comments for authors, editors, admins
  let status = 'pending';
  if (['author', 'editor', 'admin'].includes(req.user.role)) {
    status = 'approved';
  }
  
  // Create comment
  const newComment = await Comment.create({
    content: req.body.content,
    post: req.params.postId,
    user: req.user.id,
    parent: req.body.parent || null,
    status
  });
  
  logger.info('Comment created', { 
    id: newComment._id, 
    post: post._id,
    user: req.user.id,
    status
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment
    }
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  // Check if user is the comment owner
  if (comment.user.id !== req.user.id) {
    return next(new AppError('You can only update your own comments', 403));
  }
  
  // Update comment
  comment.content = req.body.content;
  
  // Reset status to pending if not an author/editor/admin
  if (!['author', 'editor', 'admin'].includes(req.user.role)) {
    comment.status = 'pending';
  }
  
  await comment.save();
  
  logger.info('Comment updated', { 
    id: comment._id, 
    updater: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      comment
    }
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  // Check if user is the comment owner or has admin/editor role
  if (
    comment.user.id !== req.user.id && 
    !['editor', 'admin'].includes(req.user.role)
  ) {
    return next(new AppError('You do not have permission to delete this comment', 403));
  }
  
  await Comment.findByIdAndDelete(req.params.id);
  
  logger.info('Comment deleted', { 
    id: comment._id, 
    deleter: req.user.id
  });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  // Check if user already liked this comment
  const alreadyLiked = comment.likedBy.includes(req.user.id);
  
  if (alreadyLiked) {
    // Unlike
    comment.likes = Math.max(0, comment.likes - 1);
    comment.likedBy = comment.likedBy.filter(
      userId => userId.toString() !== req.user.id
    );
  } else {
    // Like
    comment.likes += 1;
    comment.likedBy.push(req.user.id);
    
    // Remove from disliked if previously disliked
    if (comment.dislikedBy.includes(req.user.id)) {
      comment.dislikes = Math.max(0, comment.dislikes - 1);
      comment.dislikedBy = comment.dislikedBy.filter(
        userId => userId.toString() !== req.user.id
      );
    }
  }
  
  await comment.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      likes: comment.likes,
      dislikes: comment.dislikes,
      liked: !alreadyLiked
    }
  });
});

exports.dislikeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  // Check if user already disliked this comment
  const alreadyDisliked = comment.dislikedBy.includes(req.user.id);
  
  if (alreadyDisliked) {
    // Remove dislike
    comment.dislikes = Math.max(0, comment.dislikes - 1);
    comment.dislikedBy = comment.dislikedBy.filter(
      userId => userId.toString() !== req.user.id
    );
  } else {
    // Dislike
    comment.dislikes += 1;
    comment.dislikedBy.push(req.user.id);
    
    // Remove from liked if previously liked
    if (comment.likedBy.includes(req.user.id)) {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedBy = comment.likedBy.filter(
        userId => userId.toString() !== req.user.id
      );
    }
  }
  
  await comment.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      likes: comment.likes,
      dislikes: comment.dislikes,
      disliked: !alreadyDisliked
    }
  });
});

exports.getPendingComments = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  // Get pending comments
  const comments = await Comment.find({ status: 'pending' })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'post',
      select: 'title slug'
    });
  
  // Get total count for pagination
  const total = await Comment.countDocuments({ status: 'pending' });
  
  res.status(200).json({
    status: 'success',
    results: comments.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      comments
    }
  });
});

exports.approveComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  comment.status = 'approved';
  await comment.save();
  
  logger.info('Comment approved', { 
    id: comment._id, 
    approver: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      comment
    }
  });
});

exports.rejectComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  
  comment.status = 'rejected';
  await comment.save();
  
  logger.info('Comment rejected', { 
    id: comment._id, 
    rejecter: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      comment
    }
  });
});