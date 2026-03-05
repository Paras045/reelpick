import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { likeMovie, unlikeMovie } from "../../services/likes";
import { auth, db } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import "./HeroBanner.css";

export default function HeroBanner({ movie }) {
    const [liked, setLiked] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (!user || !movie?.id) return;
        const ref = doc(db, "userLikes", `${user.uid}_${movie.id}`);
        getDoc(ref).then((snap) => setLiked(!!snap.exists()));
    }, [user, movie?.id]);

    const handleLike = async () => {
        if (!user) return;
        if (liked) { await unlikeMovie(user.uid, movie.id); setLiked(false); }
        else { await likeMovie(user.uid, movie); setLiked(true); }
    };

    if (!movie) return null;

    const backdrop = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null;

    const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
    const rating = movie.vote_average;

    return (
        <section className="hero">
            {/* Backdrop */}
            <div className="hero__backdrop">
                {backdrop ? (
                    <img
                        className={`hero__img ${imgLoaded ? "hero__img--loaded" : ""}`}
                        src={backdrop}
                        alt={movie.title || movie.name}
                        onLoad={() => setImgLoaded(true)}
                    />
                ) : (
                    <div className="hero__img-placeholder" />
                )}
                {/* Gradient overlays */}
                <div className="hero__gradient-bottom" />
                <div className="hero__gradient-left" />
                <div className="hero__gradient-top" />
            </div>

            {/* Content */}
            <div className="hero__content">
                {/* Genre badges */}
                {movie.genre_ids?.slice(0, 3).length > 0 && (
                    <div className="hero__genres">
                        {movie.genre_ids.slice(0, 3).map((id) => (
                            <span key={id} className="hero__genre-badge">
                                {GENRE_MAP[id] || ""}
                            </span>
                        ))}
                    </div>
                )}

                <h1 className="hero__title">{movie.title || movie.name}</h1>

                {/* Meta row */}
                <div className="hero__meta">
                    {rating > 0 && (
                        <span className="hero__rating">⭐ {rating.toFixed(1)}</span>
                    )}
                    {year && <span className="hero__year">{year}</span>}
                    {movie.original_language && (
                        <span className="hero__lang">{movie.original_language.toUpperCase()}</span>
                    )}
                </div>

                {/* Overview */}
                <p className="hero__overview">
                    {movie.overview?.length > 200
                        ? movie.overview.slice(0, 200) + "…"
                        : movie.overview}
                </p>

                {/* CTA buttons */}
                <div className="hero__actions">
                    <button
                        className="hero__btn hero__btn--primary"
                        onClick={() => navigate(`/movie/${movie.id}`, { state: movie })}
                    >
                        ▶ Watch Trailer
                    </button>

                    <button
                        className={`hero__btn hero__btn--secondary ${liked ? "hero__btn--liked" : ""}`}
                        onClick={handleLike}
                    >
                        {liked ? "❤️ In Your Picks" : "🤍 Add to Picks"}
                    </button>

                    <button
                        className="hero__btn hero__btn--outline"
                        onClick={() => navigate(`/movie/${movie.id}`, { state: movie })}
                    >
                        ℹ More Info
                    </button>
                </div>
            </div>
        </section>
    );
}

// TMDB genre id → name map (subset)
const GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    18: "Drama", 10751: "Family", 14: "Fantasy", 27: "Horror", 10749: "Romance",
    878: "Sci-Fi", 53: "Thriller", 37: "Western", 99: "Documentary",
};
