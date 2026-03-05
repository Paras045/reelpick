import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
import TasteProfile from "./pages/TasteProfile";

// New layout navbar
import Navbar from "./components/layout/Navbar";
import OnboardingModal from "./components/OnboardingModal";
import LoginPage from "./pages/LoginPage";

import "./App.css";
import "./theme.css";

function App() {
  const [user] = useAuthState(auth);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
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
      <Navbar />

      {/* When NOT logged in, show a floating login prompt */}
      {!user && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 500,
          background: "var(--bg-2)", border: "1px solid var(--border-2)",
          borderRadius: "var(--r-lg)", padding: "16px 20px",
          boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: "0.88rem", color: "var(--text-2)" }}>Sign in for personalized picks</span>
          <Link to="/login" style={{
            background: "var(--accent)", color: "#fff", textDecoration: "none",
            padding: "8px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: "600"
          }}>Join ReelPick</Link>
        </div>
      )}

      <main style={{ paddingTop: 68 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/genre/:name" element={<Genre />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/your-picks" element={<YourPicks />} />
          <Route path="/made-for-you" element={<MadeForYou />} />
          <Route path="/top-picks-today" element={<TopPicksToday />} />
          <Route path="/taste-profile" element={<TasteProfile />} />
        </Routes>
      </main>

      {showOnboarding && user && (
        <OnboardingModal user={user} onComplete={() => setShowOnboarding(false)} />
      )}
    </BrowserRouter>
  );
}

export default App;
