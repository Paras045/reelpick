
import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./MadeForYou.css";
import tmdb from "../services/tmdb";
import MovieCard from "../components/MovieCard";

export default function MadeForYou(){
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      try{
        // 1) preferences
        const prefRef = doc(db, "userPreferences", user.uid);
        const prefSnap = await getDoc(prefRef);
        if (!prefSnap.exists()) { setItems([]); setLoading(false); return; }
        const prefs = prefSnap.data();

        // 2) liked movies
        const q = query(collection(db, "userLikes"), where("userId", "==", user.uid));
        const likeSnap = await getDocs(q);
        const liked = likeSnap.docs.map(d => d.data().movie || {});

        // 3) fetch candidate lists (trending + popular)
        const [tRes, pRes] = await Promise.all([
          tmdb.get("/trending/all/week"),
          tmdb.get("/movie/popular")
        ]);

        let candidates = [...(tRes.data.results||[]), ...(pRes.data.results||[])];

        // only movies (trending can include tv) and dedupe by id
        const map = new Map();
        candidates.forEach(c => {
          if (c.media_type && c.media_type !== 'movie') return;
          if (!map.has(c.id)) map.set(c.id, c);
        });

        const uniq = Array.from(map.values());

        // fetch detailed info (credits) for a limited subset to avoid many API calls
        const MAX_FETCH = 40;
        const toFetch = uniq.slice(0, MAX_FETCH);

        const details = await Promise.all(toFetch.map(async m => {
          try{
            const res = await tmdb.get(`/movie/${m.id}`, { params: { append_to_response: 'credits' } });
            return res.data;
          }catch(e){
            // fallback to original item
            return m;
          }
        }));

        // score and explain
        const scored = details.map(m => ({
          movie: m,
          score: scoreMovie(m, prefs, liked),
          because: explainMovie(m, prefs, liked)
        }))
        .filter(x => x.score > 0)
        .sort((a,b) => b.score - a.score)
        .slice(0,20);

        setItems(scored.map(s => s.movie));
        const rmap = {};
        scored.forEach(s => { rmap[s.movie.id] = s.because; });
        setReasons(rmap);
      }catch(err){
        console.error('Failed to load MadeForYou:', err);
      }finally{
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) return <p style={{color:'#fff'}}>Loading personalised picks…</p>;
  if (!user) return <p style={{color:'#fff'}}>Please sign in to see personalised recommendations.</p>;
  if (!items || items.length === 0) return <p style={{color:'#aaa'}}>No personalised picks available yet.</p>;

  return (
    <div className="page">
      <h2 className="section-title">Made for You</h2>
      <p className="section-subtitle">Movies & shows picked based on your taste</p>

      <div className="movie-grid">
        {items.map(m => (
          <MovieCard key={m.id} movie={m} note={reasons[m.id]?.join(' • ')} />
        ))}
      </div>
    </div>
  );
}

function getGenreIds(movie){
  if (!movie) return [];
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length) return movie.genre_ids;
  if (Array.isArray(movie.genres) && movie.genres.length) return movie.genres.map(g=>g.id);
  return [];
}

function scoreMovie(movie, prefs, liked){
  let score = 0;

  // actors
  (movie.credits?.cast || []).forEach(c => {
    if (prefs.actors?.find(a => a.id === c.id || a.name === c.name)) score += 2;
  });

  // directors / writers
  (movie.credits?.crew || []).forEach(c => {
    if (c.job === 'Director' && prefs.directors?.find(d => d.id === c.id || d.name === c.name)) score += 2;
    if ((c.job === 'Writer' || c.job === 'Screenplay') && prefs.writers?.find(w => w.id === c.id || w.name === c.name)) score += 1.5;
  });

  // genres
  const genreIds = getGenreIds(movie);
  genreIds.forEach(g => { if (prefs.genres?.includes(g)) score += 1; });

  // language
  if (prefs.languages?.includes(movie.original_language)) score += 1;

  // boost if similar to liked
  (liked || []).forEach(l => {
    const lGenres = getGenreIds(l);
    if (lGenres.some(g => genreIds.includes(g))) score += 0.5;
  });

  return score;
}

function explainMovie(movie, prefs, liked){
  const reasons = [];
  (movie.credits?.cast || []).forEach(c => {
    if (prefs.actors?.find(a => a.id === c.id || a.name === c.name)) reasons.push(`Stars ${c.name}`);
  });
  (movie.credits?.crew || []).forEach(c => {
    if (c.job === 'Director' && prefs.directors?.find(d => d.id === c.id || d.name === c.name)) reasons.push(`Directed by ${c.name}`);
  });
  const genreIds = getGenreIds(movie);
  if (genreIds.some(g => (prefs.genres||[]).includes(g))) reasons.push('Matches your favourite genres');

  return [...new Set(reasons)].slice(0,3);
}
