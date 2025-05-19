const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// Public search routes
router.get('/', searchController.search);
router.get('/suggest', searchController.getSuggestions);
router.get('/advanced', searchController.advancedSearch);

module.exports = router;