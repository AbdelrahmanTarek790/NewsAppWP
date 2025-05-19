const express = require('express');
const { body } = require('express-validator');
const mediaController = require('../controllers/mediaController');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');

const router = express.Router();

// All media routes require authentication
router.use(authController.protect);

router.route('/')
  .get(mediaController.getAllMedia)
  .post(
    upload.single('file'),
    [
      body('alt').optional().isString(),
      body('title').optional().isString(),
      body('caption').optional().isString(),
      body('description').optional().isString()
    ],
    validate,
    mediaController.uploadMedia
  );

router.get('/search', mediaController.searchMedia);

router.route('/:id')
  .get(mediaController.getMedia)
  .patch(
    [
      body('alt').optional().isString(),
      body('title').optional().isString(),
      body('caption').optional().isString(),
      body('description').optional().isString()
    ],
    validate,
    mediaController.updateMedia
  )
  .delete(mediaController.deleteMedia);

router.post('/bulk',
  upload.array('files', 10),
  mediaController.uploadMultipleMedia
);

router.delete('/bulk', mediaController.deleteMultipleMedia);

module.exports = router;