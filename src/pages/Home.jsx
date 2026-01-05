import { useEffect, useState } from "react";
import { getTrending } from "../services/tmdb";
import { getRecommendations } from "../services/recommend";
import MovieCard from "../components/MovieCard";


const Home = ({ likedMovies }) => {
  const [movies, setMovies] = useState([]);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);

    getTrending()
      .then(data => {
        console.log("TRENDING DATA:", data);

        // Normalize response to always be an array:
        // - if `getTrending` returned an array, use it
        // - if it returned an axios response, use res.data.results
        const trending = Array.isArray(data)
          ? data
          : data?.data?.results || data?.results || [];

        // If no data returned, surface a friendly message
        if (!trending || trending.length === 0) {
          setError(
            "No trending movies: check your TMDB credentials (REACT_APP_TMDB_TOKEN or REACT_APP_TMDB_API_KEY) in .env"
          );
        }

        setMovies(trending);
        setRecs(getRecommendations(likedMovies, trending));
      })
      .catch(err => {
        console.error("Failed to load trending:", err);
        setError(`Failed to load trending movies: ${err.response?.status} ${err.response?.statusText || err.message}`);
        setMovies([]);
        setRecs([]);
      });
  }, [likedMovies]);

  return (
    <>
      <h2>🔥 Trending</h2>
      {error && (
        <div style={{ color: "#ffcc00", padding: "8px 0" }}>{error}</div>
      )}

      <div className="movie-grid">
        {Array.isArray(movies) && movies.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
    </>
  );
};

export default Home;
