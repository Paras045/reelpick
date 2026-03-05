
import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./MadeForYou.css";
import { getRecommendations } from "../services/api";
import MovieCard from "../components/movies/MovieCard";

export default function MadeForYou() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        // 1) User preferences
        const prefRef = doc(db, "userPreferences", user.uid);
        const prefSnap = await getDoc(prefRef);
        const prefs = prefSnap.exists() ? prefSnap.data() : {};

        // 2) Liked movies
        const q = query(collection(db, "userLikes"), where("userId", "==", user.uid));
        const likeSnap = await getDocs(q);
        const liked = likeSnap.docs.map((d) => d.data().movie || {});

        // 3) Watch history
        const hq = query(collection(db, "watchHistory"), where("userId", "==", user.uid));
        const histSnap = await getDocs(hq);
        const watchHistory = histSnap.docs.map((d) => d.data().movie || {});

        // 4) Backend hybrid recommendation engine
        const res = await getRecommendations(user.uid, prefs, liked, watchHistory, 20);
        console.log("Recommendations result:", res.data); // Debug log

        const results = res.data?.data?.results || [];
        setItems(results.map((r) => r.movie).filter(Boolean));

        const rmap = {};
        results.forEach((r) => {
          if (r.movie?.id) rmap[r.movie.id] = r.reasons;
        });
        setReasons(rmap);
      } catch (err) {
        console.error("Failed to load MadeForYou:", err);
        setError("Could not load personalised picks right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) return <p style={{ color: "#fff" }}>Loading personalised picks…</p>;
  if (!user) return <p style={{ color: "#fff" }}>Please sign in to see personalised recommendations.</p>;
  if (error) return <p style={{ color: "#ffcc00" }}>{error}</p>;
  if (!items || items.length === 0)
    return <p style={{ color: "#aaa" }}>No personalised picks available yet. Like more movies!</p>;

  return (
    <div className="made-container">
      <div className="section-header">
        <h2 className="section-title">Made for You</h2>
        <p className="section-subtitle">Movies &amp; shows picked by our hybrid recommendation engine</p>
      </div>

      <div className="movie-grid">
        {items.map((m) => (
          <div key={m.id} className="made-card-wrap">
            <MovieCard movie={m} />
            {reasons[m.id] && (
              <div className="reason-chip">
                {reasons[m.id].join(" • ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
