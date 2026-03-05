const cache = require('../services/cacheService');
const tmdb = require('../services/tmdbService');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/trending?region=GLOBAL&page=1
 * Returns trending movies for the given region. Cached per region+page for 6 hours.
 */
const getTrending = asyncHandler(async (req, res) => {
  const region = (req.query.region || 'GLOBAL').toUpperCase();
  const page = parseInt(req.query.page, 10) || 1;

  const cacheKey = `trending:${region}:${page}`;
  const cached = await cache.get(cacheKey);
  if (cached) return success(res, cached);

  let response;
  let data;

  try {
    if (region === 'GLOBAL') {
      response = await tmdb.getTrendingGlobal(page);
    } else {
      response = await tmdb.getTrendingByRegion(region, page);
    }
    data = response.data;

    // If region returns empty, fall back to global
    if (!data.results || data.results.length === 0) {
      response = await tmdb.getTrendingGlobal(page);
      data = response.data;
      data._fallback = true;
    }
  } catch {
    // Always fall back to global on error
    response = await tmdb.getTrendingGlobal(page);
    data = response.data;
    data._fallback = true;
  }

  await cache.set(cacheKey, data);
  success(res, data);
});

module.exports = { getTrending };
