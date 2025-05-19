const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

const router = express.Router();

// Public routes
router.get('/post/:postId', commentController.getCommentsByPost);

// Protected routes
router.use(authController.protect);

router.post('/post/:postId',
  [
    body('content')
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot be more than 1000 characters')
  ],
  validate,
  commentController.createComment
);

router.route('/:id')
  .patch(
    [
      body('content')
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 1000 })
        .withMessage('Comment cannot be more than 1000 characters')
    ],
    validate,
    commentController.updateComment
  )
  .delete(commentController.deleteComment);

router.post('/:id/like', commentController.likeComment);
router.post('/:id/dislike', commentController.dislikeComment);

// Moderation routes (restricted to editors and admins)
router.use(authController.restrictTo('editor', 'admin'));

router.get('/pending', commentController.getPendingComments);
router.patch('/:id/approve', commentController.approveComment);
router.patch('/:id/reject', commentController.rejectComment);

module.exports = router;