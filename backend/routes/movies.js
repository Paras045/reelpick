const { getMovie } = require('../controllers/movieController');
const asyncHandler = require('../utils/asyncHandler');
const express = require('express');

const router = express.Router();

// GET /api/movie/:id
router.get('/:id', getMovie);

module.exports = router;
