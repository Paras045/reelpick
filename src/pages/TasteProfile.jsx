import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useTasteProfile } from '../hooks/useTasteProfile';
import './TasteProfile.css';

const DECADE_LABELS = {
    1950: '50s', 1960: '60s', 1970: '70s', 1980: '80s',
    1990: '90s', 2000: '2000s', 2010: '2010s', 2020: '2020s',
};

export default function TasteProfile() {
    const [user] = useAuthState(auth);
    const { topGenres, topActors, preferredDecade, totalLiked, totalWatched, loading, error } =
        useTasteProfile(user);

    if (!user)
        return (
            <div className="tp-empty">
                <p>Please sign in to see your Taste Profile.</p>
            </div>
        );

    if (loading)
        return (
            <div className="tp-loading">
                <div className="tp-spinner" />
                <p>Analysing your taste…</p>
            </div>
        );

    if (error) return <div className="tp-empty"><p>{error}</p></div>;

    const hasData = topGenres.length > 0 || topActors.length > 0;

    return (
        <div className="tp-page">
            {/* ── Header ── */}
            <div className="tp-header">
                <img src={user.photoURL} alt={user.displayName} className="tp-avatar" />
                <div className="tp-user-info">
                    <h1 className="tp-name">{user.displayName}</h1>
                    <p className="tp-tagline">Your personalised taste profile</p>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="tp-stats">
                <div className="tp-stat">
                    <span className="tp-stat-num">{totalLiked}</span>
                    <span className="tp-stat-label">Liked</span>
                </div>
                <div className="tp-stat">
                    <span className="tp-stat-num">{totalWatched}</span>
                    <span className="tp-stat-label">Watched</span>
                </div>
                {preferredDecade && (
                    <div className="tp-stat">
                        <span className="tp-stat-num">{DECADE_LABELS[preferredDecade] || `${preferredDecade}s`}</span>
                        <span className="tp-stat-label">Fav Decade</span>
                    </div>
                )}
            </div>

            {!hasData && (
                <div className="tp-empty-inner">
                    <p>Like and watch more movies to build your taste profile!</p>
                </div>
            )}

            {/* ── Top Genres ── */}
            {topGenres.length > 0 && (
                <section className="tp-section">
                    <h2 className="tp-section-title">Top Genres</h2>
                    <div className="tp-genres">
                        {topGenres.map((g) => (
                            <div key={g.id} className="tp-genre-row">
                                <span className="tp-genre-name">{g.name}</span>
                                <div className="tp-bar-track">
                                    <div
                                        className="tp-bar-fill"
                                        style={{ width: `${g.pct}%` }}
                                    />
                                </div>
                                <span className="tp-genre-count">{g.count}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Top Actors ── */}
            {topActors.length > 0 && (
                <section className="tp-section">
                    <h2 className="tp-section-title">Favourite Actors</h2>
                    <div className="tp-actors">
                        {topActors.map((a, i) => (
                            <div key={a.name} className="tp-actor-chip">
                                <span className="tp-actor-rank">#{i + 1}</span>
                                <span className="tp-actor-name">{a.name}</span>
                                <span className="tp-actor-movies">{a.count} movie{a.count !== 1 ? 's' : ''}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Preferred Decade ── */}
            {preferredDecade && (
                <section className="tp-section tp-decade-section">
                    <h2 className="tp-section-title">Preferred Era</h2>
                    <div className="tp-decade-badge">
                        {DECADE_LABELS[preferredDecade] || `${preferredDecade}s`}
                    </div>
                    <p className="tp-decade-sub">You tend to enjoy films from the {preferredDecade}s</p>
                </section>
            )}
        </div>
    );
}
