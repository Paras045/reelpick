import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Genre from "./pages/Genre";
import YourPicks from "./pages/YourPicks";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import MadeForYou from "./pages/MadeForYou";
import TopPicksToday from "./pages/TopPicksToday";
import Navbar from "./components/Navbar";
import OnboardingModal from "./components/OnboardingModal";

import "./App.css";
import "./theme.css";
console.log("V3 KEY =", process.env.REACT_APP_TMDB_API_KEY);
console.log("V4 TOKEN =", process.env.REACT_APP_TMDB_BEARER);

function App() {
  const [theme, setTheme] = useState("dark");
  const [user] = useAuthState(auth);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    document.body.className = theme === "light" ? "light" : "";
  }, [theme]);

  useEffect(() => {
    // when user logs in, check if preferences exist
    const checkPrefs = async () => {
      if (!user) return setShowOnboarding(false);
      try {
        const ref = doc(db, "userPreferences", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) setShowOnboarding(true);
        else setShowOnboarding(false);
      } catch (err) {
        console.error("Failed to check user preferences:", err);
      }
    };
    checkPrefs();
  }, [user]);

  return (
    <BrowserRouter>
      <Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/" element={<Home likedMovies={[]} />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/genre/:name" element={<Genre />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/your-picks" element={<YourPicks />} />
        <Route path="/made-for-you" element={<MadeForYou />} />
        <Route path="/top-picks-today" element={<TopPicksToday />} />
      </Routes>

      {showOnboarding && user && <OnboardingModal user={user} onComplete={() => setShowOnboarding(false)} />}
    </BrowserRouter>
  );
}

export default App;
