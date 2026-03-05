import "./MovieCard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { likeMovie, unlikeMovie } from "../services/likes";

const MovieCard = ({ movie, note }) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "userLikes", `${user.uid}_${movie.id}`);
    getDoc(ref).then(snap => setLiked(!!snap.exists()));
  }, [user, movie.id]);

  const handleLike = async (e) => {
    e.stopPropagation(); // prevent card click
    if (!user) return;

    if (liked) {
      await unlikeMovie(user.uid, movie.id);
      setLiked(false);
    } else {
      await likeMovie(user.uid, movie);
      setLiked(true);
    }
  };

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movie/${movie.id}`, { state: movie })}
      style={{ cursor: "pointer" }}
    >
      {movie.poster_path ? (
        <img
          className="movie-poster"
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title || movie.name}
          loading="lazy"
        />
      ) : (
        <div
          className="movie-poster"
          style={{
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#555",
            fontSize: "0.75rem",
            minHeight: 180,
          }}
        >
          No Poster
        </div>
      )}

      <p className="movie-title">{movie.title || movie.name}</p>

      {/** optional note (e.g., reasons for recommendation) */}
      {typeof note === 'string' && note.length > 0 && (
        <div className="movie-note">{note}</div>
      )}

      <button
        className={`like-btn ${liked ? "liked" : ""}`}
        onClick={handleLike}
      >
        {liked ? "Unlike" : "Like"}
      </button>
    </div>
  );
};

export default MovieCard;
