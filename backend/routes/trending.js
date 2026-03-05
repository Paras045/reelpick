const express = require('express');
const { getTrending } = require('../controllers/trendingController');

const router = express.Router();

// GET /api/trending?region=GLOBAL&page=1
router.get('/', getTrending);

module.exports = router;
