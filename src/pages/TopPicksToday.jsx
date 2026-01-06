import "./TopPicksToday.css";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import MovieCard from "../components/MovieCard";
import { computeDailyRecommendations } from "../services/recommender";

export default function TopPicksToday(){
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const recomputeTimer = useRef(null);
  const likesUnsubRef = useRef(null);

  useEffect(()=>{
    let mounted = true;

    const computeAndCache = async (force=false) => {
      if (!user) return;
      setLoading(true);
      try{
        const cacheRef = doc(db, 'recommendationsCache', user.uid);
        const today = new Date().toISOString().slice(0,10);

        if (!force){
          const snap = await getDoc(cacheRef);
          if (snap.exists() && snap.data()?.daily?.date === today){
            const data = snap.data().daily;
            if (mounted){
              setItems(data.results || []);
              setReasons(data.reasons || {});
              setLoading(false);
            }
            return;
          }
        }

        // load user prefs
        const prefSnap = await getDoc(doc(db, 'userPreferences', user.uid));
        const prefs = prefSnap.exists() ? prefSnap.data() : {};

        // load likes (for boost)
        const likesQ = query(collection(db, 'userLikes'), where('userId', '==', user.uid));
        const likeSnap = await getDocs(likesQ);
        const liked = likeSnap.docs.map(d => d.data().movie || {});

        const scored = await computeDailyRecommendations(user.uid, prefs, liked || []);

        const results = scored.map(s => s.movie);
        const rmap = {};
        scored.forEach(s => { rmap[s.movie.id] = s.reason; });

        // write cache
        await setDoc(cacheRef, { daily: { date: today, results: results.slice(0,20), reasons: rmap, updatedAt: Date.now() } }, { merge:true });

        if (mounted){
          setItems(results);
          setReasons(rmap);
        }
      }catch(err){
        console.error('Failed to compute Top Picks:', err);
      }finally{
        if (mounted) setLoading(false);
      }
    };

    const scheduleRecompute = (delay=500) => {
      if (recomputeTimer.current) clearTimeout(recomputeTimer.current);
      recomputeTimer.current = setTimeout(()=> computeAndCache(true), delay);
    };

    const setup = async () => {
      if (!user) { setLoading(false); return; }

      // initial compute or load from cache
      await computeAndCache(false);

      // subscribe to likes changes to recompute in realtime
      const q = query(collection(db, 'userLikes'), where('userId', '==', user.uid));
      likesUnsubRef.current = onSnapshot(q, (snap) => {
        // debounce rapid changes
        scheduleRecompute(800);
      });
    };

    setup();

    return () => { mounted = false; if (recomputeTimer.current) clearTimeout(recomputeTimer.current); if (likesUnsubRef.current) likesUnsubRef.current(); };
  }, [user]);

  if (loading) return <p style={{color:'#fff'}}>Loading Top Picks for Today…</p>;
  if (!user) return <p style={{color:'#fff'}}>Please sign in to see Top Picks for Today.</p>;
  if (!items || items.length === 0) return <p style={{color:'#aaa'}}>No personalised picks available today.</p>;

  return (
    <div style={{padding:20}}>
      <h2 style={{color:'#fff'}}>Top Picks for Today</h2>
      <p style={{color:'#aaa'}}>Fresh picks tailored to your tastes</p>

      <div className="movie-grid">
        {items.map(m => (
          <div key={m.id}>
            <MovieCard movie={m} />
            <small style={{color:'#999'}}>{reasons[m.id]?.join(' • ')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
