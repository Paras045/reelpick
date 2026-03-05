import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { likeMovie, unlikeMovie } from "../../services/likes";
import { auth, db } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import AuthModal from "../ui/AuthModal";
import "./MovieCard.css";

export default function MovieCard({ movie, note }) {
    const [liked, setLiked] = useState(false);
    const [liking, setLiking] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (!user || !movie?.id) return;
        const ref = doc(db, "userLikes", `${user.uid}_${movie.id}`);
        getDoc(ref).then((snap) => setLiked(!!snap.exists()));
    }, [user, movie?.id]);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (liking) return;
        setLiking(true);
        try {
            if (liked) {
                await unlikeMovie(user.uid, movie.id);
                setLiked(false);
            } else {
                await likeMovie(user.uid, movie);
                setLiked(true);
            }
        } finally {
            setLiking(false);
        }
    };

    const rating = movie?.vote_average;
    const year = (movie?.release_date || movie?.first_air_date || "").slice(0, 4);

    return (
        <>
            <div
                className="mcard"
                onClick={() => navigate(`/movie/${movie.id}`, { state: movie })}
            >
                {/* Poster */}
                <div className="mcard__poster-wrap">
                    {!imgLoaded && <div className="mcard__poster-skeleton skeleton-base" />}
                    {movie.poster_path ? (
                        <img
                            className={`mcard__poster ${imgLoaded ? "mcard__poster--loaded" : ""}`}
                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                            alt={movie.title || movie.name}
                            loading="lazy"
                            onLoad={() => setImgLoaded(true)}
                        />
                    ) : (
                        <div className="mcard__poster-placeholder">
                            <span>🎬</span>
                        </div>
                    )}

                    {/* Rating badge */}
                    {rating > 0 && (
                        <div className="mcard__rating">
                            ⭐ {rating.toFixed(1)}
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="mcard__overlay">
                        <div className="mcard__overlay-content">
                            <p className="mcard__overlay-title">{movie.title || movie.name}</p>
                            {year && <span className="mcard__overlay-year">{year}</span>}
                            <div className="mcard__overlay-actions">
                                <button
                                    className={`mcard__like-btn ${liked ? "mcard__like-btn--liked" : ""}`}
                                    onClick={handleLike}
                                    disabled={liking}
                                    title={liked ? "Remove from picks" : "Add to picks"}
                                >
                                    {liked ? "❤️Saved" : "🤍Save"}
                                </button>
                                <button
                                    className="mcard__detail-btn"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`, { state: movie }); }}
                                >
                                    ▶ Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card footer */}
                <div className="mcard__footer">
                    <p className="mcard__title">{movie.title || movie.name}</p>
                    {note && <p className="mcard__note">{note}</p>}
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message="Sign in to save movies and build your personalization profile!"
            />
        </>
    );
}
