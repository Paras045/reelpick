const axios = require('axios');
require('dotenv').config();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const BEARER = process.env.TMDB_BEARER;
const API_KEY = process.env.TMDB_API_KEY;

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    ...(BEARER ? { Authorization: `Bearer ${BEARER}` } : {}),
  },
});

// Fallback: attach api_key if no bearer token
tmdb.interceptors.request.use((config) => {
  if (!BEARER && API_KEY) {
    config.params = { ...(config.params || {}), api_key: API_KEY };
  }
  return config;
});

// ─── Movie Endpoints ──────────────────────────────────────────────────────────

const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,recommendations,keywords' },
  });

const getMovieCredits = (id) => tmdb.get(`/movie/${id}/credits`);

const getMovieVideos = (id) => tmdb.get(`/movie/${id}/videos`);

const getSimilarMovies = (id) => tmdb.get(`/movie/${id}/similar`);

const getWatchProviders = (id) => tmdb.get(`/movie/${id}/watch/providers`);

// ─── Search ───────────────────────────────────────────────────────────────────

const searchMulti = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page, include_adult: false } });

// ─── Trending / Discover ─────────────────────────────────────────────────────

const getTrendingGlobal = (page = 1) =>
  tmdb.get('/trending/movie/week', { params: { page } });

const getTrendingByRegion = (region, page = 1) =>
  tmdb.get('/discover/movie', {
    params: {
      sort_by: 'popularity.desc',
      watch_region: region,
      include_adult: false,
      page,
    },
  });

// ─── Recommendation Candidates ────────────────────────────────────────────────

const getPopularMovies = (page = 1) =>
  tmdb.get('/movie/popular', { params: { page } });

const getTopRatedMovies = (page = 1) =>
  tmdb.get('/movie/top_rated', { params: { page } });

const getTrendingAll = () => tmdb.get('/trending/all/week');

/**
 * Fetch full detail + credits for a candidate movie (for scoring).
 * Returns raw data or the fallback minimal object on error.
 */
const getMovieWithCredits = async (movieId, fallback = {}) => {
  try {
    const res = await tmdb.get(`/movie/${movieId}`, {
      params: { append_to_response: 'credits,keywords' },
    });
    return res.data;
  } catch {
    return fallback;
  }
};

module.exports = {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getWatchProviders,
  searchMulti,
  getTrendingGlobal,
  getTrendingByRegion,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingAll,
  getMovieWithCredits,
};
