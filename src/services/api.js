import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Movies ───────────────────────────────────────────────────────────────────

/**
 * Get full movie details (credits, videos, recommendations, keywords).
 * @param {number|string} id - TMDB movie ID
 */
export const getMovieDetails = (id) => api.get(`/api/movie/${id}`);

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Multi-search movies, shows, and people.
 * @param {string} q    - search query
 * @param {number} page - page number (default 1)
 */
export const searchMovies = (q, page = 1) =>
  api.get('/api/search', { params: { q, page } });

// ─── Trending ─────────────────────────────────────────────────────────────────

/**
 * Get trending movies for a region.
 * @param {string} region - 'GLOBAL' or ISO 3166-1 code like 'IN', 'US'
 * @param {number} page
 */
export const getTrending = (region = 'GLOBAL', page = 1) =>
  api.get('/api/trending', { params: { region, page } });

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Get personalized hybrid recommendations from backend engine.
 * @param {string}   userId       - Firebase UID
 * @param {object}   prefs        - userPreferences doc data
 * @param {object[]} liked        - liked movie objects
 * @param {object[]} watchHistory - watched movie objects
 * @param {number}   maxResults
 */
export const getRecommendations = (
  userId,
  prefs = {},
  liked = [],
  watchHistory = [],
  maxResults = 20
) =>
  api.post('/api/recommendations', {
    userId,
    prefs,
    liked,
    watchHistory,
    maxResults,
  });

// ─── Watch Providers ─────────────────────────────────────────────────────────

/**
 * Get streaming/rent/buy providers for a movie in a region.
 * @param {number|string} movieId
 * @param {string}        region  - ISO 3166-1 code, default 'IN'
 */
export const getWatchProviders = (movieId, region = 'IN') =>
  api.get(`/api/watch-providers/${movieId}`, { params: { region } });

export default api;
