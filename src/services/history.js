import { setDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const saveWatch = async (userId, movie) => {
  return await setDoc(
    doc(db, "watchHistory", `${userId}_${movie.id}`),
    {
      userId,
      movieId: movie.id,
      movie,
      timestamp: Date.now()
    }
  );
};