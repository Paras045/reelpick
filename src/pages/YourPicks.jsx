import "./YourPicks.css";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import MovieCard from "../components/MovieCard";

const YourPicks = () => {
  const [liked, setLiked] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "userLikes"),
      where("userId", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      setLiked(snap.docs.map(doc => doc.data().movie));
    });
  }, [user]);

  return (
    <>
      <h2 style={{color:"#fff"}}>Your Picks</h2>

      <div className="movie-grid">
        {liked.length === 0 && (
          <p style={{color:"#aaa"}}>No likes yet</p>
        )} 

        {liked.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  );
};

export default YourPicks;
