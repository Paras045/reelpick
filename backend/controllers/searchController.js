const cache = require('../services/cacheService');
const tmdb = require('../services/tmdbService');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/search?q=<query>&page=<page>
 * Multi-search (movies, tv, people). Cached for 6 hours per unique query+page.
 */
const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const page = parseInt(req.query.page, 10) || 1;

  if (!q) return success(res, { results: [], total_results: 0, total_pages: 0 });

  const cacheKey = `search:${q.toLowerCase()}:${page}`;
  const cached = await cache.get(cacheKey);
  if (cached) return success(res, cached);

  const response = await tmdb.searchMulti(q, page);
  const data = response.data;

  await cache.set(cacheKey, data);
  success(res, data);
});

module.exports = { search };
