import tmdb from "./tmdb";

function getGenreIds(movie){
  if (!movie) return [];
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length) return movie.genre_ids;
  if (Array.isArray(movie.genres) && movie.genres.length) return movie.genres.map(g=>g.id);
  return [];
}

// simple string->float hash in [0,1)
function hashToFloat(str){
  let h = 2166136261 >>> 0;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0) / 4294967296;
}

export function scoreMovie(movie, prefs, liked){
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

export function explainMovie(movie, prefs, liked){
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

export async function computeDailyRecommendations(userId, prefs, liked, maxResults=20){
  // fetch candidate pools
  const [tRes, pRes, topRes] = await Promise.all([
    tmdb.get('/trending/all/week').catch(()=>({data:{results:[]}})),
    tmdb.get('/movie/popular').catch(()=>({data:{results:[]}})),
    tmdb.get('/movie/top_rated').catch(()=>({data:{results:[]}}))
  ]);

  let candidates = [...(tRes.data.results||[]), ...(pRes.data.results||[]), ...(topRes.data.results||[])];

  // only movies and dedupe
  const map = new Map();
  candidates.forEach(c => {
    if (c.media_type && c.media_type !== 'movie') return;
    if (!map.has(c.id)) map.set(c.id, c);
  });
  const uniq = Array.from(map.values());

  // limit fetch details
  const MAX_FETCH = 60;
  const toFetch = uniq.slice(0, MAX_FETCH);

  const details = await Promise.all(toFetch.map(async m => {
    try{
      const res = await tmdb.get(`/movie/${m.id}`, { params: { append_to_response: 'credits' } });
      return res.data;
    }catch(e){
      return m;
    }
  }));

  const today = new Date().toISOString().slice(0,10);
  const dailyOffset = hashToFloat(userId + today) - 0.5; // in [-0.5,0.5)

  const scored = details.map(m => {
    let s = scoreMovie(m, prefs, liked || []);

    // recency boost: release within 365 days
    const rel = m.release_date || m.first_air_date;
    if (rel){
      const days = (new Date() - new Date(rel)) / (1000*60*60*24);
      if (days < 365) s += 0.7;
    }

    // popularity weight
    if (m.popularity) s += Math.min(2, m.popularity / 100);

    // daily randomness
    s += dailyOffset;

    return { movie: m, score: s, reason: explainMovie(m, prefs, liked) };
  });

  const final = scored.filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,maxResults);

  return final; // array of {movie, score, reason}
}
