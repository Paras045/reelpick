export const getRecommendations = (likedMovies, allMovies) => {
  if (!likedMovies?.length || !allMovies?.length) return [];

  const likedGenres = new Set(
    likedMovies.flatMap(m => m.genre_ids || [])
  );

  return allMovies
    .filter(m => (m.genre_ids || []).some(g => likedGenres.has(g)))
    .slice(0, 12);
};
