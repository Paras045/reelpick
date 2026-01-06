
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import tmdb from "../services/tmdb";
import { likeMovie, unlikeMovie } from "../services/likes";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import MovieCard from "../components/MovieCard";
import { doc, getDoc } from "firebase/firestore";
import { saveWatch } from "../services/history"; 

export default function MovieDetails(){
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie,setMovie]=useState(null);
  const [trailer,setTrailer]=useState(null);
  const [cast,setCast]=useState([]);
  const [similar,setSimilar]=useState([]);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);

  // keep a simple alias so templates can reference `recs` as recommended
  const recs = similar || [];

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!movie || !user) return;
    const ref = doc(db, "userLikes", `${user.uid}_${movie.id}`);
    getDoc(ref).then(snap => setLiked(!!snap.exists()));
  }, [user, movie?.id]);

  useEffect(() => {
    if (user && movie) {
      saveWatch(user.uid, movie).catch(err => console.error("saveWatch failed", err));
    }
  }, [user, movie]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setError(null);
        setMovie(null); // clear previous movie to avoid stale UI while loading
        const res = await tmdb.get(`/movie/${id}`, { params: { append_to_response: "credits,videos,recommendations" } });
        setMovie(res.data);
        const vid = (res.data.videos?.results || []).find(v=>v.type==="Trailer"&&v.site==="YouTube") || (res.data.videos?.results||[])[0];
        setTrailer(vid?.key);
        setCast((res.data.credits?.cast||[]).slice(0,6));
        setSimilar((res.data.recommendations?.results||[]).slice(0,8));
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        setError('Movie not found or unavailable');
        setMovie(null);
      }
    };
    fetchMovie();
  }, [id]);



  if (error) return <p style={{color:"#ffcc00"}}>{error}</p>;
  if(!movie) return <p style={{color:"#fff"}}>Loading…</p>; 

  return(
    <div style={{padding:28, color:"#fff"}}>

      <button className="btn" onClick={()=>navigate(-1)}>← Back</button>

      <h1 style={{marginTop:12}}>{movie.title||movie.name}</h1>

      <div className="genre-row">
        {movie.genres?.map(g => (
          <span key={g.id}>{g.name}</span>
        ))}
      </div>

      <div className="meta-row">
        <span>{movie.runtime} min</span>
        <span>{new Date(movie.release_date || movie.first_air_date).toDateString()}</span>
      </div>

      {/* AUTOPLAY PREVIEW OR FALLBACK */}
      {trailer ? (
        <iframe
          className="trailer-frame"
          width="100%"
          height="420"
          src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1`}
          allow="autoplay"
          style={{borderRadius:14,marginTop:14}}
        />
      ) : (
        <div className="trailer-fallback" style={{width:'100%',height:420, background:'linear-gradient(135deg, rgba(15,15,15,0.9), rgba(25,25,25,0.9))', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', marginTop:14, backdropFilter:'blur(8px)'}}>
          Trailer Not Available
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
        {trailer ? (
          <button
            className="btn"
            onClick={()=>window.open(`https://youtube.com/watch?v=${trailer}`)}
          >
            ▶ Watch Trailer
          </button>
        ) : (
          <button className="btn" disabled style={{opacity:0.6, cursor:'not-allowed'}}>Trailer not available</button>
        )}

        <button
          onClick={async () => {
            if (!user) return;

            if (liked) {
              await unlikeMovie(user.uid, movie.id);
              setLiked(false);
            } else {
              await likeMovie(user.uid, movie);
              setLiked(true);
            }
          }}
          className={`like-btn ${liked ? "liked" : ""}`}
        >
          {liked ? "Unlike" : "Like"}
        </button>
      </div> 

      <p className="plot">{movie.overview}</p>

      <h3>Cast</h3>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        {cast.map(c=>(
          <div key={c.id} style={{textAlign:"center"}}>
            <img
              src={`https://image.tmdb.org/t/p/w200${c.profile_path}`}
              style={{borderRadius:10,width:120}}
            />
            <p>{c.name}</p>
          </div>
        ))}
      </div>

      <h3>Recommended</h3>

      <div className="movie-grid recs-grid">
        {recs?.map(rec => (
          <MovieCard key={rec.id} movie={rec} />
        ))}
      </div> 
    </div>
  );
}
