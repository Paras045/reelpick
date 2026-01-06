
import { useEffect, useState } from "react";
import tmdb from "../services/tmdb";
import MovieCard from "../components/MovieCard";

export default function Series() {
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    tmdb
      .get("/tv/popular")
      .then(res => setSeries(res.data?.results || []))
      .catch(err => {
        console.error("Failed to load popular series:", err);
        setError("Failed to load popular series. Check console for details.");
        setSeries([]);
      });
  }, []);

  return (
    <div>
      <h2>Popular Series</h2>
      {error && <div style={{ color: "#ffcc00" }}>{error}</div>}
      <div className="movie-grid">
        {series.map(s => (
          <MovieCard key={s.id} movie={s} />
        ))}
      </div>
    </div>
  );
}
