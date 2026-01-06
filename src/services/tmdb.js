import axios from "axios";

const token = process.env.REACT_APP_TMDB_BEARER;
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

console.log("TMDB TOKEN present =", !!token);
console.log("TMDB API_KEY present =", !!API_KEY);

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
});

// Attach api_key if bearer token isn't present
tmdb.interceptors.request.use((config) => {
  if (!token && API_KEY) {
    config.params = { ...(config.params || {}), api_key: API_KEY };
  }
  return config;
});

export const getTrending = () => tmdb.get("/discover/movie", {
  params: {
    sort_by: "popularity.desc",
    include_adult: false,
    include_video: false,
    language: "en-US",
    page: 1,
    with_watch_monetization_types: "flatrate"
  }
});
export const getTrendingGlobal = () => tmdb.get("/discover/movie", {
  params: {
    sort_by: "popularity.desc",
    include_adult: false,
    include_video: false,
    language: "en-US",
    page: 1,
    with_watch_monetization_types: "flatrate"
  }
});
export const getTrendingByRegion = (regionCode, type = "movie") => tmdb.get(`/discover/${type}`, {
  params: {
    sort_by: "popularity.desc",
    include_adult: false,
    include_video: false,
    language: "en-US",
    page: 1,
    with_watch_monetization_types: "flatrate",
    watch_region: regionCode
  }
});
export const searchMulti = (query) => tmdb.get(`/search/multi`, { params: { query } });
export const getVideos = (id, media_type = "movie") => tmdb.get(`/${media_type}/${id}/videos`);
export const getDetails = (id, type = "movie") => tmdb.get(`/${type}/${id}`);
export const getCredits = (id, type = "movie") => tmdb.get(`/${type}/${id}/credits`);
export const getSimilar = (id, type = "movie") => tmdb.get(`/${type}/${id}/similar`);

export default tmdb;
