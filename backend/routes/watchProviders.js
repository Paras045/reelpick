const express = require('express');
const { getWatchProviders } = require('../controllers/watchProviderController');

const router = express.Router();

// GET /api/watch-providers/:id?region=IN
router.get('/:id', getWatchProviders);

module.exports = router;
