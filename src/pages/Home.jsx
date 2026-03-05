import "./Home.css";
import { useEffect, useState } from "react";
import { getTrending } from "../services/api";
import { REGIONS } from "../services/regions";
import HeroBanner from "../components/movies/HeroBanner";
import MovieRow from "../components/movies/MovieRow";

const Home = () => {
  const [region, setRegion] = useState("GLOBAL");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setError(null);
      setLoading(true);

      // localStorage cache
      const cached = localStorage.getItem(`trending_${region}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setMovies(parsed);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(`trending_${region}`);
        }
      }

      try {
        const res = await getTrending(region, 1);
        const data = res.data.data;
        const trending = data?.results || [];
        if (data?._fallback) setError("Showing global trending — region data unavailable.");
        setMovies(trending);
        localStorage.setItem(`trending_${region}`, JSON.stringify(trending));
      } catch {
        setError("Could not load trending. Showing global instead.");
        try {
          const res = await getTrending("GLOBAL", 1);
          setMovies(res.data.data?.results || []);
        } catch { setMovies([]); }
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [region]);

  // Pick hero from position 2 (more visually interesting than index 0)
  const heroMovie = movies[1] || movies[0] || null;
  // Split into rows
  const newReleases = movies.slice(0, 20);
  const popularPicks = [...movies].reverse().slice(0, 20);
  const topRated = movies.filter(m => m.vote_average >= 7).slice(0, 20);

  return (
    <div className="home">
      {/* Hero Banner */}
      {(loading || heroMovie) && (
        loading ? (
          <div className="home__hero-skeleton skeleton-base" />
        ) : (
          <HeroBanner movie={heroMovie} />
        )
      )}

      {/* Region selector strip */}
      <div className="home__region-strip">
        <span className="home__region-label">Trending in</span>
        <select
          className="home__region-select"
          value={region}
          onChange={(e) => { setRegion(e.target.value); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
        {error && <span className="home__region-error">{error}</span>}
      </div>

      {/* Movie Rows */}
      <div className="home__rows">
        <MovieRow
          title="🔥 Trending Now"
          movies={newReleases}
          loading={loading}
          viewAllPath="/movies"
        />
        <MovieRow
          title="⭐ Top Rated"
          movies={topRated}
          loading={loading}
          viewAllPath="/movies"
        />
        <MovieRow
          title="🎬 Popular Picks"
          movies={popularPicks}
          loading={loading}
          viewAllPath="/movies"
        />
      </div>
    </div>
  );
};

export default Home;
