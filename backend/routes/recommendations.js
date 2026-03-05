const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

// POST /api/recommendations
router.post('/', getRecommendations);

module.exports = router;
