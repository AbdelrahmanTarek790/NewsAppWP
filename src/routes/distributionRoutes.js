const express = require('express');
const { body } = require('express-validator');
const distributionController = require('../controllers/distributionController');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

const router = express.Router();

// All distribution routes require authentication
router.use(authController.protect);

router.get('/', distributionController.getAllDistributions);
router.get('/calendar', distributionController.getDistributionCalendar);
router.get('/analytics', distributionController.getDistributionAnalytics);
router.get('/channels', distributionController.getAvailableChannels);
router.get('/:id', distributionController.getDistribution);

router.post('/',
  [
    body('title')
      .notEmpty()
      .withMessage('A distribution must have a title')
      .isLength({ max: 100 })
      .withMessage('A distribution title cannot be more than 100 characters'),
    body('content')
      .notEmpty()
      .withMessage('Content ID is required'),
    body('channel')
      .notEmpty()
      .withMessage('Channel is required')
      .isIn(['social-twitter', 'social-facebook', 'social-linkedin', 'social-instagram', 'email-newsletter', 'push-notification'])
      .withMessage('Channel must be a valid channel type'),
    body('scheduledFor')
      .notEmpty()
      .withMessage('Scheduled date is required')
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Message cannot be more than 500 characters')
  ],
  validate,
  distributionController.createDistribution
);

router.post('/social',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content ID is required'),
    body('channel')
      .notEmpty()
      .withMessage('Social channel is required')
      .isIn(['social-twitter', 'social-facebook', 'social-linkedin', 'social-instagram'])
      .withMessage('Channel must be a valid social channel'),
    body('scheduledFor')
      .notEmpty()
      .withMessage('Scheduled date is required')
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Message cannot be more than 500 characters')
  ],
  validate,
  distributionController.scheduleSocialPost
);

router.post('/email',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content ID is required'),
    body('scheduledFor')
      .notEmpty()
      .withMessage('Scheduled date is required')
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
    body('subject').notEmpty().withMessage('Email subject is required'),
    body('template').optional().isString()
  ],
  validate,
  distributionController.scheduleEmailNewsletter
);

router.post('/push',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content ID is required'),
    body('scheduledFor')
      .notEmpty()
      .withMessage('Scheduled date is required')
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
    body('message')
      .notEmpty()
      .withMessage('Push notification message is required')
      .isLength({ max: 200 })
      .withMessage('Message cannot be more than 200 characters')
  ],
  validate,
  distributionController.schedulePushNotification
);

router.post('/execute/:id', distributionController.executeDistribution);

router.patch('/:id',
  [
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('A distribution title cannot be more than 100 characters'),
    body('scheduledFor')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be a valid date'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Message cannot be more than 500 characters')
  ],
  validate,
  distributionController.updateDistribution
);

router.patch('/:id/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['scheduled', 'sent', 'failed', 'cancelled'])
      .withMessage('Status must be a valid status')
  ],
  validate,
  distributionController.updateDistributionStatus
);

router.delete('/:id', distributionController.deleteDistribution);

module.exports = router;