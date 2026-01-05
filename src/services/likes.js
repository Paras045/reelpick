import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export const likeMovie = async (userId, movie) => {
  return await setDoc(doc(db, "userLikes", `${userId}_${movie.id}`), {
    userId,
    movieId: movie.id,
    movie,
    liked: true,
    timestamp: Date.now(),
    genres: movie.genre_ids || []
  });
};

export const unlikeMovie = async (userId, movieId) => {
  return await deleteDoc(doc(db, "userLikes", `${userId}_${movieId}`));
};
