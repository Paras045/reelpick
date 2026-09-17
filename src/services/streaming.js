/**
 * Return the authorized watch-options page for a TMDB movie.
 * TMDB lists the legal streaming, rental, and purchase providers by region.
 */
export function getStreamingUrl(tmdbId) {
  if (!tmdbId) return "";

  return `https://rivestream.ru/watch?type=movie&id=${tmdbId}`;
}
