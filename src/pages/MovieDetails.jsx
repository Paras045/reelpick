import "./MovieDetails.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieDetails } from "../services/api";
import { likeMovie, unlikeMovie } from "../services/likes";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import MovieCard from "../components/movies/MovieCard";
import MovieRow from "../components/movies/MovieRow";
import WatchProviders from "../components/WatchProviders";
import AuthModal from "../components/ui/AuthModal";
import { doc, getDoc } from "firebase/firestore";
import { saveWatch } from "../services/history";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => window.scrollTo(0, 0), [id]);

  useEffect(() => {
    if (!movie || !user) return;
    const ref = doc(db, "userLikes", `${user.uid}_${movie.id}`);
    getDoc(ref).then((snap) => setLiked(!!snap.exists()));
  }, [user, movie?.id]);

  useEffect(() => {
    if (user && movie) {
      saveWatch(user.uid, movie).catch(console.error);
    }
  }, [user, movie]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await getMovieDetails(id);
        const data = res.data.data;

        setMovie(data);
        const vid =
          (data.videos?.results || []).find((v) => v.type === "Trailer" && v.site === "YouTube") ||
          (data.videos?.results || [])[0];

        setTrailer(vid?.key);
        setCast((data.credits?.cast || []).slice(0, 10));
        setSimilar(data.recommendations?.results || []);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        setError("Movie not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleLike = async () => {
    if (!user) return setShowAuthModal(true);
    if (liked) {
      await unlikeMovie(user.uid, movie.id);
      setLiked(false);
    } else {
      await likeMovie(user.uid, movie);
      setLiked(true);
    }
  };

  if (error) return <div className="mdetails__msg">{error}</div>;
  if (loading) return <div className="mdetails__msg mdetails__msg--loading">Loading…</div>;
  if (!movie) return null;

  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);

  return (
    <div className="mdetails">
      {/* Cinematic Hero Section */}
      <section className="mdetails__hero">
        <div className="mdetails__hero-bg">
          {backdrop && <img src={backdrop} alt="" className="mdetails__hero-img" />}
          <div className="mdetails__hero-gradient" />
        </div>

        <div className="mdetails__hero-content">
          <div className="mdetails__hero-left">
            <div className="mdetails__poster-wrap">
              {!imgLoaded && <div className="skeleton-base mdetails__poster-skeleton" />}
              {poster ? (
                <img
                  src={poster}
                  alt={movie.title || movie.name}
                  className={`mdetails__poster ${imgLoaded ? "mdetails__poster--loaded" : ""}`}
                  onLoad={() => setImgLoaded(true)}
                />
              ) : (
                <div className="mdetails__poster-placeholder">🎬</div>
              )}
            </div>
          </div>

          <div className="mdetails__hero-right">
            <h1 className="mdetails__title">{movie.title || movie.name} {year && <span className="mdetails__year">({year})</span>}</h1>

            <div className="mdetails__meta">
              {movie.vote_average > 0 && <span className="mdetails__rating">⭐ {movie.vote_average.toFixed(1)}</span>}
              <span className="mdetails__runtime">{movie.runtime} min</span>
              <div className="mdetails__genres">
                {movie.genres?.map((g) => <span key={g.id} className="mdetails__tag">{g.name}</span>)}
              </div>
            </div>

            <p className="mdetails__tagline">{movie.tagline}</p>
            <p className="mdetails__overview">{movie.overview}</p>

            <div className="mdetails__actions">
              {trailer ? (
                <button
                  className="hero__btn hero__btn--primary"
                  onClick={() => document.getElementById("trailer").scrollIntoView({ behavior: "smooth" })}
                >
                  ▶ Watch Trailer
                </button>
              ) : (
                <button className="hero__btn hero__btn--primary" disabled style={{ opacity: 0.5 }}>
                  Trailer Unavailable
                </button>
              )}

              <button
                className={`hero__btn hero__btn--secondary ${liked ? "hero__btn--liked" : ""}`}
                onClick={handleLike}
              >
                {liked ? "❤️ In Your Picks" : "🤍 Add to Picks"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Details */}
      <div className="mdetails__body app-container">

        {/* Watch Providers Ribbon */}
        <section className="mdetails__providers">
          <WatchProviders movieId={id} />
        </section>

        {/* Trailer */}
        {trailer && (
          <section id="trailer" className="mdetails__section">
            <h2 className="mdetails__section-title">Official Trailer</h2>
            <div className="mdetails__video-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${trailer}?rel=0`}
                title="Trailer"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Cast (Mobile-friendly horizontal scroll) */}
        {cast.length > 0 && (
          <section className="mdetails__section mdetails__cast-section">
            <h2 className="mdetails__section-title">Top Cast</h2>
            <div className="mdetails__cast-track">
              {cast.map((c) => (
                <div key={c.id} className="mdetails__cast-card">
                  {c.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                      alt={c.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="mdetails__cast-placeholder">👤</div>
                  )}
                  <p className="mdetails__cast-name">{c.name}</p>
                  <p className="mdetails__cast-role">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations via MovieRow */}
        {similar.length > 0 && (
          <section className="mdetails__recs">
            <MovieRow title="Similar Titles For You" movies={similar} />
          </section>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign in to save movies and build your personalization profile!"
      />
    </div>
  );
}
