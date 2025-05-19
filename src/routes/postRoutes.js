const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

const router = express.Router();

// Public routes
router.get('/', postController.getAllPosts);
router.get('/featured', postController.getFeaturedPosts);
router.get('/trending', postController.getTrendingPosts);
router.get('/search', postController.searchPosts);
router.get('/:slug', postController.getPostBySlug);

// Protected routes
router.use(authController.protect);

router.get('/my/posts', postController.getMyPosts);
router.get('/my/drafts', postController.getMyDrafts);

router.post('/',
  [
    body('title')
      .notEmpty()
      .withMessage('A post must have a title')
      .isLength({ max: 100 })
      .withMessage('A post title cannot be more than 100 characters'),
    body('content')
      .notEmpty()
      .withMessage('A post must have content'),
    body('excerpt')
      .optional()
      .isLength({ max: 200 })
      .withMessage('An excerpt cannot be more than 200 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'scheduled', 'archived'])
      .withMessage('Status must be draft, published, scheduled, or archived')
  ],
  validate,
  postController.createPost
);

router.patch('/:id',
  [
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('A post title cannot be more than 100 characters'),
    body('excerpt')
      .optional()
      .isLength({ max: 200 })
      .withMessage('An excerpt cannot be more than 200 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'scheduled', 'archived'])
      .withMessage('Status must be draft, published, scheduled, or archived')
  ],
  validate,
  postController.updatePost
);

router.delete('/:id', postController.deletePost);

router.patch('/:id/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['draft', 'published', 'scheduled', 'archived'])
      .withMessage('Status must be draft, published, scheduled, or archived'),
    body('scheduledFor')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be a valid date')
  ],
  validate,
  postController.updatePostStatus
);

module.exports = router;