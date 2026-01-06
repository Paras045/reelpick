import { Link } from "react-router-dom";
import "./Navbar.css";
import { useState, useEffect } from "react";
import Login from "./Login";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  return (
    <header className="nav">
      <div className="nav-left">

        <Link to="/" className="logo">
          ReelPick
        </Link>

        <nav className="nav-menu">

          <Link to="/movies" className="nav-item">Movies</Link>

          <Link to="/series" className="nav-item">Series</Link>

          <div className="nav-item group">
            Category ▾
            <div className="dropdown">
              <Link to="/genre/action">Action</Link>
              <Link to="/genre/drama">Drama</Link>
              <Link to="/genre/scifi">Sci-Fi</Link>
              <Link to="/genre/comedy">Comedy</Link>
            </div>
          </div>

          <Link to="/search" className="nav-item">Search</Link>
          <Link to="/made-for-you" className="nav-item">Made for You</Link>
          <Link to="/top-picks-today" className="nav-item">Top Picks Today</Link>
        </nav>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <img src={user.photoURL} alt={user.displayName} className="pfp" />
            <button className="btn" onClick={() => signOut(auth)}>Logout</button>
          </>
        ) : (
          <Login />
        )}
      </div>
    </header>
  );
}

