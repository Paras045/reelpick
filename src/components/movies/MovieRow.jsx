import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import SkeletonCard from "../ui/SkeletonCard";
import "./MovieRow.css";

export default function MovieRow({ title, movies = [], loading = false, viewAllPath }) {
    const rowRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = useCallback(() => {
        const el = rowRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }, []);

    const scroll = (dir) => {
        const el = rowRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 700, behavior: "smooth" });
        setTimeout(updateScrollState, 400);
    };

    return (
        <section className="mrow">
            <div className="mrow__header">
                <h2 className="mrow__title">{title}</h2>
                {viewAllPath && (
                    <Link to={viewAllPath} className="mrow__see-all">
                        See all →
                    </Link>
                )}
            </div>

            <div className="mrow__track-wrap">
                {/* Left scroll button */}
                {canScrollLeft && (
                    <button className="mrow__scroll-btn mrow__scroll-btn--left" onClick={() => scroll(-1)} aria-label="Scroll left">
                        ‹
                    </button>
                )}

                <div
                    className="mrow__track"
                    ref={rowRef}
                    onScroll={updateScrollState}
                >
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                        : movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                </div>

                {/* Right scroll button */}
                {canScrollRight && movies.length > 4 && (
                    <button className="mrow__scroll-btn mrow__scroll-btn--right" onClick={() => scroll(1)} aria-label="Scroll right">
                        ›
                    </button>
                )}
            </div>
        </section>
    );
}
