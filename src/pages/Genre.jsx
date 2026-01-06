
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import tmdb from "../services/tmdb";
import MovieCard from "../components/MovieCard";

const GENRES = {
  action: 28,
  drama: 18,
  comedy: 35,
  thriller: 53,
  scifi: 878,
};

export default function Genre(){
  const { name } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const id = GENRES[name?.toLowerCase()];
      if (!id) {
        setMovies([]);
        setLoading(false);
        return;
      }

      try{
        const res = await tmdb.get(`/discover/movie`, { params: { with_genres: id } });
        setMovies(res.data.results || []);
      }catch(err){
        console.error('Failed to load genre:', err);
        setMovies([]);
      } finally{
        setLoading(false);
      }
    };

    load();
  }, [name]);

  return (
    <div style={{padding:20}}>
      <h2 style={{color:'#fff'}}>{name ? `${name} Movies` : 'Genre'}</h2>

      {loading && <p style={{color:'#aaa'}}>Loading…</p>}

      <div className="movie-grid">
        {movies.length === 0 && !loading && (
          <p style={{color:'#aaa'}}>No movies found for this genre.</p>
        )}

        {movies.map(m => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}