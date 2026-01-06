
import { useEffect, useState } from "react";
import tmdb from "../services/tmdb";
import MovieCard from "../components/MovieCard";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    tmdb
      .get("/movie/popular")
      .then(res => setMovies(res.data?.results || []))
      .catch(err => {
        console.error("Failed to load popular movies:", err);
        setError("Failed to load popular movies. Check console for details.");
        setMovies([]);
      });
  }, []);

  return (
    <div style={{ paddingTop: '80px' }}>
      <h2>Popular Movies</h2>
      {error && <div style={{ color: "#ffcc00" }}>{error}</div>}
      <div className="movies-grid">
        {movies.map(m => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
