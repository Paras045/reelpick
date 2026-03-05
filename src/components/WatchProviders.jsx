import { useWatchProviders } from '../hooks/useWatchProviders';
import './WatchProviders.css';

/**
 * Displays streaming, rent, and buy options for a movie.
 * Uses the useWatchProviders hook → backend → TMDB.
 */
export default function WatchProviders({ movieId, region = 'IN' }) {
    const { providers, loading, error } = useWatchProviders(movieId, region);

    if (loading) return <div className="wp-loading">Loading watch options…</div>;
    if (error) return null; // Silent fail — not critical

    const hasAny =
        providers &&
        (providers.flatrate?.length || providers.rent?.length || providers.buy?.length);

    if (!hasAny)
        return (
            <div className="wp-none">
                Not available to stream or rent in your region.{' '}
                {providers?.tmdbLink && (
                    <a href={providers.tmdbLink} target="_blank" rel="noopener noreferrer">
                        Check all regions →
                    </a>
                )}
            </div>
        );

    return (
        <div className="wp-container">
            <h3 className="wp-title">Where to Watch</h3>

            {providers.flatrate?.length > 0 && (
                <div className="wp-section">
                    <span className="wp-label">Stream</span>
                    <div className="wp-logos">
                        {providers.flatrate.map((p) => (
                            <div key={p.id} className="wp-provider" title={p.name}>
                                {p.logo ? (
                                    <img src={p.logo} alt={p.name} className="wp-logo" loading="lazy" />
                                ) : (
                                    <span className="wp-name-fallback">{p.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {providers.rent?.length > 0 && (
                <div className="wp-section">
                    <span className="wp-label">Rent</span>
                    <div className="wp-logos">
                        {providers.rent.map((p) => (
                            <div key={p.id} className="wp-provider" title={p.name}>
                                {p.logo ? (
                                    <img src={p.logo} alt={p.name} className="wp-logo" loading="lazy" />
                                ) : (
                                    <span className="wp-name-fallback">{p.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {providers.buy?.length > 0 && (
                <div className="wp-section">
                    <span className="wp-label">Buy</span>
                    <div className="wp-logos">
                        {providers.buy.map((p) => (
                            <div key={p.id} className="wp-provider" title={p.name}>
                                {p.logo ? (
                                    <img src={p.logo} alt={p.name} className="wp-logo" loading="lazy" />
                                ) : (
                                    <span className="wp-name-fallback">{p.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {providers.tmdbLink && (
                <a
                    className="wp-more-link"
                    href={providers.tmdbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View all regions on TMDB →
                </a>
            )}
        </div>
    );
}
