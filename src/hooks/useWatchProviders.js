import { useState, useEffect } from 'react';
import { getWatchProviders } from '../services/api';

/**
 * Hook to fetch streaming/rent/buy providers for a movie.
 * @param {number|string} movieId
 * @param {string}        region  - ISO 3166-1 code (default 'IN')
 */
export function useWatchProviders(movieId, region = 'IN') {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) return;
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getWatchProviders(movieId, region);
        if (!cancelled) setProviders(res.data.data);
      } catch (err) {
        if (!cancelled) setError('Watch provider info unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [movieId, region]);

  return { providers, loading, error };
}
