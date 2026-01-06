import "./Home.css";
import { useEffect, useState } from "react";
import { getTrendingGlobal, getTrendingByRegion } from "../services/tmdb";
import { getRecommendations } from "../services/recommend";
import { REGIONS } from "../services/regions";
import MovieCard from "../components/MovieCard";

const Home = ({ likedMovies }) => {
  const [region, setRegion] = useState("IN");
  const [movies, setMovies] = useState([]);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setError(null);
      setLoading(true);

      const cachedData = localStorage.getItem(`trending_${region}`);
      if (cachedData) {
        const trending = JSON.parse(cachedData);
        setMovies(trending);
        setRecs(getRecommendations(likedMovies, trending));
        setLoading(false);
        return;
      }

      try {
        const data = await getTrendingByRegion(region);

        console.log("TRENDING DATA:", data);

        // Normalize response to always be an array:
        // - if returned an array, use it
        // - if it returned an axios response, use res.data.results
        const trending = Array.isArray(data)
          ? data
          : data?.data?.results || data?.results || [];

        // If no data returned, fallback to global trending
        if (!trending || trending.length === 0) {
          setError("Trending unavailable for this region. Showing global trending instead.");
          const globalData = await getTrendingGlobal();
          const globalTrending = Array.isArray(globalData)
            ? globalData
            : globalData?.data?.results || globalData?.results || [];
          setMovies(globalTrending);
          setRecs(getRecommendations(likedMovies, globalTrending));
          localStorage.setItem(`trending_${region}`, JSON.stringify(globalTrending));
        } else {
          setMovies(trending);
          setRecs(getRecommendations(likedMovies, trending));
          localStorage.setItem(`trending_${region}`, JSON.stringify(trending));
        }
      } catch (err) {
        console.error("Failed to load trending:", err);
        if (region !== "US") {
          setRegion("US");
        } else {
          setError("Trending unavailable for this region. Showing global trending instead.");
          try {
            const globalData = await getTrendingGlobal();
            const globalTrending = Array.isArray(globalData)
              ? globalData
              : globalData?.data?.results || globalData?.results || [];
            setMovies(globalTrending);
            setRecs(getRecommendations(likedMovies, globalTrending));
          } catch (globalErr) {
            setMovies([]);
            setRecs([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [region, likedMovies]);

  return (
    <>
      <div className="trending-header">
        <h2>Trending</h2>
        <select
          className="region-selector"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {REGIONS.map(r => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>
      {error && (
        <div style={{ color: "#ffcc00", padding: "8px 0" }}>{error}</div>
      )}
      {loading ? (
        <div className="skeleton-loader">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      ) : (
        <div className="movie-grid">
          {Array.isArray(movies) && movies.map(m => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </>
  );
};

export default Home;
