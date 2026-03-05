import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const GENRE_NAMES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

/**
 * Analyzes a user's Firestore liked movies + watch history to build a taste profile.
 * @param {object|null} user - Firebase auth user
 */
export function useTasteProfile(user) {
  const [topGenres, setTopGenres] = useState([]);
  const [topActors, setTopActors] = useState([]);
  const [preferredDecade, setPreferredDecade] = useState(null);
  const [totalLiked, setTotalLiked] = useState(0);
  const [totalWatched, setTotalWatched] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    const compute = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch liked movies
        const likesQ = query(collection(db, 'userLikes'), where('userId', '==', user.uid));
        const likesSnap = await getDocs(likesQ);
        const liked = likesSnap.docs.map((d) => d.data().movie || {});

        // Fetch watch history
        const histQ = query(collection(db, 'watchHistory'), where('userId', '==', user.uid));
        const histSnap = await getDocs(histQ);
        const history = histSnap.docs.map((d) => d.data().movie || {});

        const allMovies = [...liked, ...history];

        // ── Genre frequency ─────────────────────────────────────────────────
        const genreCount = {};
        allMovies.forEach((m) => {
          const ids =
            Array.isArray(m.genre_ids) && m.genre_ids.length
              ? m.genre_ids
              : (m.genres || []).map((g) => g.id);
          ids.forEach((id) => {
            genreCount[id] = (genreCount[id] || 0) + 1;
          });
        });

        const topG = Object.entries(genreCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([id, count]) => ({
            id: Number(id),
            name: GENRE_NAMES[id] || `Genre #${id}`,
            count,
          }));

        // Normalize to percentages relative to max
        const maxCount = topG[0]?.count || 1;
        const topGenresNorm = topG.map((g) => ({
          ...g,
          pct: Math.round((g.count / maxCount) * 100),
        }));

        // ── Actor frequency (from genres stored in movie objects ─────────────
        // Actor data is stored when movie has credits embedded
        const actorCount = {};
        allMovies.forEach((m) => {
          (m.credits?.cast || []).slice(0, 5).forEach((c) => {
            if (!c.name) return;
            actorCount[c.name] = (actorCount[c.name] || 0) + 1;
          });
        });

        const topA = Object.entries(actorCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }));

        // ── Preferred decade ─────────────────────────────────────────────────
        const decadeCount = {};
        allMovies.forEach((m) => {
          const yr = m.release_date
            ? parseInt(m.release_date.slice(0, 4), 10)
            : null;
          if (!yr || yr < 1900) return;
          const decade = Math.floor(yr / 10) * 10;
          decadeCount[decade] = (decadeCount[decade] || 0) + 1;
        });
        const topDecade = Object.entries(decadeCount).sort(([, a], [, b]) => b - a)[0];

        if (!cancelled) {
          setTopGenres(topGenresNorm);
          setTopActors(topA);
          setPreferredDecade(topDecade ? Number(topDecade[0]) : null);
          setTotalLiked(liked.length);
          setTotalWatched(history.length);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to compute taste profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    compute();
    return () => { cancelled = true; };
  }, [user]);

  return { topGenres, topActors, preferredDecade, totalLiked, totalWatched, loading, error };
}
