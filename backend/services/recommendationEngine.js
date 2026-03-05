/**
 * Hybrid Recommendation Engine
 *
 * Content-based:   genre match, keyword overlap, cast/crew overlap
 * User-based:      liked movie boost, watch history genre amplification
 * Quality signals: popularity, vote_average, recency
 * Variety:         daily hash offset so results rotate between days
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGenreIds(movie) {
  if (!movie) return [];
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length) return movie.genre_ids;
  if (Array.isArray(movie.genres) && movie.genres.length) return movie.genres.map((g) => g.id);
  return [];
}

function getKeywordIds(movie) {
  return (movie.keywords?.keywords || []).map((k) => k.id);
}

/** Simple stable hash → float in [0, 1) for daily variety */
function hashToFloat(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0) / 4294967296;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Score a single candidate movie against user preferences and liked history.
 *
 * @param {object} movie        - Full TMDB movie object (with credits + keywords)
 * @param {object} prefs        - Firestore userPreferences doc data
 * @param {object[]} liked      - Array of liked movie objects from Firestore
 * @param {object[]} history    - Array of watched movie objects from Firestore
 * @returns {number} score
 */
function scoreMovie(movie, prefs, liked, history) {
  let score = 0;

  const genreIds = getGenreIds(movie);
  const keywordIds = getKeywordIds(movie);
  const cast = movie.credits?.cast || [];
  const crew = movie.credits?.crew || [];

  // ── Content-based: preference match ──────────────────────────────────────

  // Genre match (user saved preferences from onboarding)
  const prefGenres = Array.isArray(prefs.genres) ? prefs.genres : [];
  genreIds.forEach((g) => {
    if (prefGenres.includes(g)) score += 1.5;
  });

  // Actor overlap with user favourites
  const prefActors = Array.isArray(prefs.actors) ? prefs.actors : [];
  cast.forEach((c) => {
    if (prefActors.find((a) => a && (a.id === c.id || a.name === c.name))) score += 2;
  });

  // Director match
  const prefDirectors = Array.isArray(prefs.directors) ? prefs.directors : [];
  const prefWriters = Array.isArray(prefs.writers) ? prefs.writers : [];
  
  crew.forEach((c) => {
    if (
      c.job === 'Director' &&
      prefDirectors.find((d) => d && (d.id === c.id || d.name === c.name))
    )
      score += 2.5;
    if (
      (c.job === 'Writer' || c.job === 'Screenplay') &&
      prefWriters.find((w) => w && (w.id === c.id || w.name === c.name))
    )
      score += 1.5;
  });

  // Language preference
  const prefLangs = Array.isArray(prefs.languages) ? prefs.languages : [];
  if (prefLangs.includes(movie.original_language)) score += 1;

  // ── User-based: liked movies signals ─────────────────────────────────────

  // Build sets from liked movies
  const likedGenreSet = new Set((liked || []).flatMap(getGenreIds));
  const likedKeywordSet = new Set((liked || []).flatMap(getKeywordIds));
  const likedCastIds = new Set(
    (liked || []).flatMap((m) => (m.credits?.cast || []).map((c) => c.id))
  );

  // Genre overlap with liked
  genreIds.forEach((g) => {
    if (likedGenreSet.has(g)) score += 0.8;
  });

  // Keyword overlap with liked
  keywordIds.forEach((k) => {
    if (likedKeywordSet.has(k)) score += 0.4;
  });

  // Cast overlap with liked movies' casts
  cast.forEach((c) => {
    if (likedCastIds.has(c.id)) score += 0.6;
  });

  // ── User-based: watch history signals ────────────────────────────────────

  const historyGenreSet = new Set((history || []).flatMap(getGenreIds));
  genreIds.forEach((g) => {
    if (historyGenreSet.has(g)) score += 0.4;
  });

  // Penalize already-watched
  const watchedIds = new Set((history || []).map((m) => m.id));
  if (watchedIds.has(movie.id)) score -= 5;

  // Penalize already-liked (already saved)
  const likedIds = new Set((liked || []).map((m) => m.id));
  if (likedIds.has(movie.id)) score -= 3;

  // ── Quality signals ────────────────────────────────────────────────────────

  // Popularity boost (cap at 2)
  if (movie.popularity) score += Math.min(2, movie.popularity / 100);

  // Vote average boost
  if (movie.vote_average) score += Math.min(1.5, (movie.vote_average - 5) * 0.3);

  // Recency boost — released within last 365 days
  const rel = movie.release_date || movie.first_air_date;
  if (rel) {
    const days = (Date.now() - new Date(rel).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 365) score += 0.7;
    if (days < 90) score += 0.5;
  }

  return score;
}

/**
 * Build human-readable reasons why a movie was recommended.
 */
function explainMovie(movie, prefs, liked) {
  const reasons = [];
  const genreIds = getGenreIds(movie);
  const cast = movie.credits?.cast || [];
  const crew = movie.credits?.crew || [];

  const prefActors = Array.isArray(prefs.actors) ? prefs.actors : [];
  cast.slice(0, 5).forEach((c) => {
    if (prefActors.find((a) => a && a.name === c.name)) reasons.push(`Stars ${c.name}`);
  });

  const prefDirectors = Array.isArray(prefs.directors) ? prefs.directors : [];
  crew.forEach((c) => {
    if (c.job === 'Director' && prefDirectors.find((d) => d && d.name === c.name))
      reasons.push(`Directed by ${c.name}`);
  });

  const prefGenres = Array.isArray(prefs.genres) ? prefs.genres : [];
  if (genreIds.some((g) => prefGenres.includes(g)))
    reasons.push('Matches your favourite genres');

  const likedGenreSet = new Set((liked || []).flatMap(getGenreIds));
  if (genreIds.some((g) => likedGenreSet.has(g)))
    reasons.push('Similar to movies you liked');

  return [...new Set(reasons)].slice(0, 3);
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

const tmdb = require('./tmdbService');

/**
 * Compute hybrid recommendations for a user.
 *
 * @param {string}   userId     - Firebase user ID (for daily hash)
 * @param {object}   prefs      - userPreferences doc
 * @param {object[]} liked      - userLikes docs (movie objects)
 * @param {object[]} history    - watchHistory docs (movie objects)
 * @param {number}   maxResults - max results to return
 */
async function computeRecommendations(userId, prefs = {}, liked = [], history = [], maxResults = 20) {
  // Fetch candidate pools
  const [tRes, pRes, topRes] = await Promise.all([
    tmdb.getTrendingAll().catch(() => ({ data: { results: [] } })),
    tmdb.getPopularMovies().catch(() => ({ data: { results: [] } })),
    tmdb.getTopRatedMovies().catch(() => ({ data: { results: [] } })),
  ]);

  let candidates = [
    ...(tRes.data.results || []),
    ...(pRes.data.results || []),
    ...(topRes.data.results || []),
  ];

  // Dedupe and filter to movies only
  const seen = new Map();
  candidates.forEach((c) => {
    if (c.media_type && c.media_type !== 'movie') return;
    if (!seen.has(c.id)) seen.set(c.id, c);
  });
  const unique = Array.from(seen.values());

  // Fetch enriched details (credits + keywords) for up to 60 candidates
  const MAX_FETCH = 60;
  const toFetch = unique.slice(0, MAX_FETCH);

  const details = await Promise.all(
    toFetch.map((m) => tmdb.getMovieWithCredits(m.id, m))
  );

  // Daily variety offset
  const today = new Date().toISOString().slice(0, 10);
  const dailyOffset = hashToFloat(String(userId) + today) * 0.6 - 0.3;

  // Score and sort
  const scored = details
    .map((m) => {
      try {
        return {
          movie: m,
          score: scoreMovie(m, prefs, liked, history) + dailyOffset,
          reasons: explainMovie(m, prefs, liked),
        };
      } catch (err) {
        console.error(`Error scoring movie ${m?.id || 'unknown'}:`, err.message);
        return null;
      }
    })
    .filter((x) => x && x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored; // [{ movie, score, reasons }]
}

module.exports = { computeRecommendations, scoreMovie, explainMovie };
