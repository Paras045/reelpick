const cache = require('../services/cacheService');
const tmdb = require('../services/tmdbService');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// TMDB streaming logo base URL
const LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

/**
 * GET /api/watch-providers/:id?region=IN
 * Returns where a movie can be watched (stream/rent/buy) in the given region.
 * Defaults to IN (India). Cached 6 hours.
 */
const getWatchProviders = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const region = (req.query.region || 'IN').toUpperCase();

  const cacheKey = `watch-providers:${id}:${region}`;
  const cached = await cache.get(cacheKey);
  if (cached) return success(res, cached);

  const response = await tmdb.getWatchProviders(id);
  const allRegions = response.data.results || {};

  // Extract the requested region, fall back to empty
  const regionData = allRegions[region] || {};

  const formatProviders = (arr = []) =>
    arr.map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: p.logo_path ? `${LOGO_BASE}${p.logo_path}` : null,
    }));

  const data = {
    region,
    tmdbLink: response.data.id
      ? `https://www.themoviedb.org/movie/${id}/watch`
      : null,
    flatrate: formatProviders(regionData.flatrate), // streaming
    rent: formatProviders(regionData.rent),
    buy: formatProviders(regionData.buy),
    availableRegions: Object.keys(allRegions),
  };

  await cache.set(cacheKey, data);
  success(res, data);
});

module.exports = { getWatchProviders };
