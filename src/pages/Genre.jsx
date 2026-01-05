import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import tmdb from "../services/tmdb";
import MovieCard from "../components/MovieCard";

const SLUG_TO_ID = {
  action: 28,
  drama: 18,
  scifi: 878,
  comedy: 35,
  thriller: 53,
  adventure: 12,
  romance: 10749,
  crime: 80
};

export default function Genre(){
  const { slug } = useParams();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = SLUG_TO_ID[slug?.toLowerCase()];
    if (!id) {
      setError(`Unknown category: ${slug}`);
      setMovies([]);
      return;
    }

    setError(null);
    tmdb
      .get("/discover/movie", { params: { with_genres: id } })
      .then(res => setMovies(res.data?.results || []))
      .catch(err => {
        console.error("Failed to load genre movies:", err);
        setError("Failed to load movies for this category. Check console for details.");
        setMovies([]);
      });
  }, [slug]);

  return (
    <div>
      <h2>Category: {slug}</h2>
      {error && <div style={{ color: "#ffcc00" }}>{error}</div>}

      <div className="movie-grid">
        {movies.map(m => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
