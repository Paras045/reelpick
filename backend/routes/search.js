const express = require('express');
const { search } = require('../controllers/searchController');

const router = express.Router();

// GET /api/search?q=&page=
router.get('/', search);

module.exports = router;
