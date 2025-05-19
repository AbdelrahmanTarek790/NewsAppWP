const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:slug/posts', categoryController.getPostsByCategory);

// Protected routes for category management
router.use(authController.protect);
router.use(authController.restrictTo('editor', 'admin'));

router.post('/',
  [
    body('name')
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 40 })
      .withMessage('Category name cannot be more than 40 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Category description cannot be more than 500 characters'),
    body('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be a boolean value'),
    body('order')
      .optional()
      .isNumeric()
      .withMessage('Order must be a number')
  ],
  validate,
  categoryController.createCategory
);

router.route('/:id')
  .patch(
    [
      body('name')
        .optional()
        .isLength({ max: 40 })
        .withMessage('Category name cannot be more than 40 characters'),
      body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Category description cannot be more than 500 characters'),
      body('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean value'),
      body('order')
        .optional()
        .isNumeric()
        .withMessage('Order must be a number')
    ],
    validate,
    categoryController.updateCategory
  )
  .delete(categoryController.deleteCategory);

module.exports = router;