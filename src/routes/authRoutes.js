const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post('/register',
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
      })
  ],
  validate,
  authController.register
);

router.post('/login',
  [
    body('email').notEmpty().withMessage('Please provide email or username'),
    body('password').notEmpty().withMessage('Please provide your password')
  ],
  validate,
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  validate,
  authController.forgotPassword
);

router.patch('/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ],
  validate,
  authController.resetPassword
);

router.patch('/update-password',
  authController.protect,
  [
    body('passwordCurrent').notEmpty().withMessage('Please provide your current password'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ],
  validate,
  authController.updatePassword
);

router.post('/verify-email/:token', authController.verifyEmail);

router.post('/resend-verification',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  validate,
  authController.resendVerification
);

router.get('/me', authController.protect, authController.getMe);

module.exports = router;