const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

const router = express.Router();

// Public routes
router.get('/authors', userController.getPublicAuthors);
router.get('/authors/:username', userController.getPublicAuthorProfile);

// Protected routes
router.use(authController.protect);

// Routes for user's own profile
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me',
  [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters'),
    body('bio')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Bio cannot be more than 200 characters')
  ],
  validate,
  userController.updateMe
);
router.delete('/delete-me', userController.deleteMe);

// Admin routes
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers)
  .post(
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please provide a valid email'),
      body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
      body('passwordConfirm')
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
          }
          return true;
        }),
      body('role')
        .optional()
        .isIn(['user', 'author', 'editor', 'admin'])
        .withMessage('Role must be user, author, editor, or admin')
    ],
    validate,
    userController.createUser
  );

router.route('/:id')
  .get(userController.getUser)
  .patch(
    [
      body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
      body('username')
        .optional()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters'),
      body('role')
        .optional()
        .isIn(['user', 'author', 'editor', 'admin'])
        .withMessage('Role must be user, author, editor, or admin')
    ],
    validate,
    userController.updateUser
  )
  .delete(userController.deleteUser);

router.patch('/:id/role',
  [
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['user', 'author', 'editor', 'admin'])
      .withMessage('Role must be user, author, editor, or admin')
  ],
  validate,
  userController.updateUserRole
);

module.exports = router;