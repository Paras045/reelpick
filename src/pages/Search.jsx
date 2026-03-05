import "./Search.css";
import debounce from "lodash.debounce";
import { searchMovies } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(-1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doSearch = useMemo(
    () =>
      debounce(async (q) => {
        if (!q) return setResults([]);
        setLoading(true);
        try {
          const res = await searchMovies(q);
          setResults((res.data.data?.results || []).slice(0, 8));
          setSelected(-1);
        } catch (e) {
          console.error("Search error:", e);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    doSearch(query);
    return () => doSearch.cancel();
  }, [query, doSearch]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      const item = selected >= 0 ? results[selected] : results[0];
      if (item) navigate(`/movie/${item.id}`, { state: item });
    } else if (e.key === "Escape") {
      setResults([]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Search</h2>

      <input
        className="search-box"
        placeholder="Search movies & shows"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {loading && (
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 8 }}>
          Searching…
        </p>
      )}

      <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden" }}>
        {results.map((r, i) => (
          <div
            key={r.id}
            className={`suggest-item ${selected === i ? "selected" : ""}`}
            onClick={() => navigate(`/movie/${r.id}`, { state: r })}
          >
            {r.title || r.name}
            {r.media_type && r.media_type !== "movie" && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: "0.72rem",
                  color: "#888",
                  background: "rgba(255,255,255,0.07)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {r.media_type}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
