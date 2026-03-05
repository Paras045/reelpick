const cache = require('../services/cacheService');
const tmdb = require('../services/tmdbService');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/movie/:id
 * Returns full movie details: metadata, credits, videos, recommendations, keywords.
 * Cache TTL: 6 hours.
 */
const getMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `movie:${id}`;

  const cached = await cache.get(cacheKey);
  if (cached) return success(res, cached);

  const response = await tmdb.getMovieDetails(id);
  const data = response.data;

  await cache.set(cacheKey, data);
  success(res, data);
});

module.exports = { getMovie };
