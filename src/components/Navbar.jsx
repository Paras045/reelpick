import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
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
        </nav>
      </div>
    </header>
  );
} 

