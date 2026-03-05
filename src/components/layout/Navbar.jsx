import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { searchMovies } from "../../services/api";
import debounce from "lodash.debounce";
import "./Navbar.css";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return unsub;
    }, []);

    // Navbar glass on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close search on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const doSearch = useMemo(
        () =>
            debounce(async (q) => {
                if (!q.trim()) { setSearchResults([]); setSearchLoading(false); return; }
                setSearchLoading(true);
                try {
                    const res = await searchMovies(q);
                    setSearchResults((res.data.data?.results || []).slice(0, 6));
                    setSearchOpen(true);
                } catch { /* silent */ }
                finally { setSearchLoading(false); }
            }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.trim()) { doSearch(val); setSearchLoading(true); }
        else { setSearchResults([]); setSearchOpen(false); }
    };

    const handleResultClick = (result) => {
        navigate(`/movie/${result.id}`, { state: result });
        setSearchQuery("");
        setSearchResults([]);
        setSearchOpen(false);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter" && searchResults[0]) handleResultClick(searchResults[0]);
        if (e.key === "Escape") { setSearchOpen(false); setSearchResults([]); }
    };

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/movies", label: "Movies" },
        { to: "/series", label: "Series" },
        { to: "/made-for-you", label: "Made For You" },
        { to: "/top-picks-today", label: "Top Picks" },
        { to: "/taste-profile", label: "Taste Profile" },
    ];

    return (
        <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            {/* Left — Logo */}
            <div className="navbar__left">
                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-icon">🎬</span>
                    ReelPick
                </Link>

                {/* Desktop nav links */}
                <nav className="navbar__links">
                    {navLinks.map((l) => (
                        <Link key={l.to} to={l.to} className="navbar__link">
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Center — Search */}
            <div className="navbar__search-wrap" ref={searchRef}>
                <div className={`navbar__search-bar ${searchQuery ? "navbar__search-bar--active" : ""}`}>
                    <svg className="navbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="navbar__search-input"
                        placeholder="Search movies & shows…"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                    />
                    {searchQuery && (
                        <button className="navbar__search-clear" onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }}>
                            ✕
                        </button>
                    )}
                </div>

                {/* Floating dropdown results */}
                {searchOpen && (
                    <div className="navbar__dropdown">
                        {searchLoading ? (
                            <div className="navbar__dropdown-loading">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="navbar__dropdown-skeleton">
                                        <div className="navbar__dropdown-skeleton-img skeleton-base" />
                                        <div className="navbar__dropdown-skeleton-lines">
                                            <div className="skeleton-base" style={{ height: 12, width: "70%", borderRadius: 4 }} />
                                            <div className="skeleton-base" style={{ height: 10, width: "40%", borderRadius: 4, marginTop: 6 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <ul className="navbar__results">
                                {searchResults.map((r) => (
                                    <li
                                        key={r.id}
                                        className="navbar__result-item"
                                        onClick={() => handleResultClick(r)}
                                    >
                                        <div className="navbar__result-poster">
                                            {r.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                                                    alt={r.title || r.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="navbar__result-no-poster">🎬</div>
                                            )}
                                        </div>
                                        <div className="navbar__result-info">
                                            <span className="navbar__result-title">{r.title || r.name}</span>
                                            <span className="navbar__result-meta">
                                                {r.media_type === "tv" ? "Series" : "Movie"}
                                                {r.release_date && ` · ${r.release_date.slice(0, 4)}`}
                                                {r.first_air_date && ` · ${r.first_air_date.slice(0, 4)}`}
                                            </span>
                                        </div>
                                        {r.vote_average > 0 && (
                                            <span className="navbar__result-rating">
                                                ⭐ {r.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </li>
                                ))}
                                <li className="navbar__results-footer" onClick={() => { navigate("/search"); setSearchOpen(false); }}>
                                    View all results for "{searchQuery}" →
                                </li>
                            </ul>
                        ) : (
                            <div className="navbar__dropdown-empty">No results for "{searchQuery}"</div>
                        )}
                    </div>
                )}
            </div>

            {/* Right — Auth */}
            <div className="navbar__right">
                {user ? (
                    <>
                        <Link to="/your-picks" className="navbar__picks-link">My Picks</Link>
                        <div className="navbar__avatar-wrap">
                            <img src={user.photoURL} alt={user.displayName} className="navbar__avatar" />
                            <div className="navbar__avatar-menu">
                                <Link to="/taste-profile" className="navbar__avatar-menu-item">Taste Profile</Link>
                                <Link to="/your-picks" className="navbar__avatar-menu-item">Your Picks</Link>
                                <button className="navbar__avatar-menu-item navbar__signout" onClick={() => signOut(auth)}>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="navbar__signin-btn" style={{ textDecoration: 'none' }}>
                        Sign In
                    </Link>
                )}

                {/* Mobile hamburger */}
                <button className="navbar__hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
                    <span /><span /><span />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <nav className="navbar__mobile-menu">
                    {navLinks.map((l) => (
                        <Link key={l.to} to={l.to} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                            {l.label}
                        </Link>
                    ))}
                    {user ? (
                        <button className="navbar__mobile-link navbar__signout" onClick={() => { signOut(auth); setMenuOpen(false); }}>
                            Sign Out
                        </button>
                    ) : (
                        <Link to="/login" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </nav>
            )}
        </header>
    );
}
