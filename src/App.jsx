import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Genre from "./pages/Genre";
import YourPicks from "./pages/YourPicks";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import Navbar from "./components/Navbar";
import "./App.css";
import "./theme.css";
console.log("V3 KEY =", process.env.REACT_APP_TMDB_API_KEY);
console.log("V4 TOKEN =", process.env.REACT_APP_TMDB_BEARER);

function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.className = theme === "light" ? "light" : "";
  }, [theme]);

  return (
    <BrowserRouter>
      <Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/" element={<Home likedMovies={[]} />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/genre/:slug" element={<Genre />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/your-picks" element={<YourPicks />} />
      </Routes>
    </BrowserRouter>
  );
} 

export default App;
