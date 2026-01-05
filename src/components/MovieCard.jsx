import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { likeMovie, unlikeMovie } from "../services/likes";

const MovieCard = ({ movie }) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLiked = async () => {
      if (!auth.currentUser) return;

      const ref = doc(db, "userLikes", `${auth.currentUser.uid}_${movie.id}`);
      const snap = await getDoc(ref);

      if (snap.exists()) setLiked(true);
    };

    checkLiked();
  }, [movie.id]);

  const handleLike = async (e) => {
    e.stopPropagation(); // prevent card click
    if (!auth.currentUser) return;

    if (liked) {
      await unlikeMovie(auth.currentUser.uid, movie.id);
      setLiked(false);
    } else {
      await likeMovie(auth.currentUser.uid, movie);
      setLiked(true);
    }
  };

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movie/${movie.id}`, { state: movie })}
      style={{ cursor: "pointer" }}
    >
      <img
        className="movie-poster"
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title || movie.name}
      />

      <p className="movie-title">{movie.title || movie.name}</p>

      <button
        className={`like-btn ${liked ? "liked" : ""}`}
        onClick={handleLike}
      >
        {liked ? "💔 Unlike" : "❤️ Like"}
      </button>
    </div>
  );
};

export default MovieCard;
