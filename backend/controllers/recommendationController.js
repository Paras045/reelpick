const { computeRecommendations } = require('../services/recommendationEngine');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/recommendations
 * Body: { userId, prefs, liked, watchHistory, maxResults? }
 *
 * Runs the hybrid recommendation engine and returns scored results.
 * Note: We do NOT cache recommendations per-user in Redis because they are
 * personalized and continuously updated by Firestore. The daily Firestore
 * cache in the frontend (recommendationsCache) handles persistence.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const {
    userId = 'anonymous',
    prefs = {},
    liked = [],
    watchHistory = [],
    maxResults = 20,
  } = req.body;

  const results = await computeRecommendations(
    userId,
    prefs,
    liked,
    watchHistory,
    Math.min(maxResults, 40) // cap at 40
  );

  success(res, {
    results: results.map((r) => ({
      movie: r.movie,
      score: parseFloat(r.score.toFixed(3)),
      reasons: r.reasons,
    })),
    count: results.length,
  });
});

module.exports = { getRecommendations };
