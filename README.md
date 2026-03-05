# 🎬 ReelPick

A personalized movie & TV recommendation web app — upgraded to production-level architecture.

[![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=nodedotjs)](https://expressjs.com)
[![Cache](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis)](https://redis.io)
[![DB](https://img.shields.io/badge/Database-Cloud_Firestore-FFCA28?logo=firebase)](https://firebase.google.com)
[![API](https://img.shields.io/badge/Data-TMDB_API-01B4E4)](https://www.themoviedb.org)

---

## System Architecture

```
Browser (React)
     │
     │  All API calls
     ▼
Express Backend (Node.js)        ←──── Redis Cache (6hr TTL)
     │
     │  Protected TMDB key
     ▼
TMDB API  (movies, search, trending, providers)

Firebase Auth  ─►  Cloud Firestore  (likes, history, preferences, rec cache)
```

The frontend never calls TMDB directly — all TMDB traffic flows through the backend, keeping API keys server-side only.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Google Login | Firebase Auth — sign in with Google |
| ❤️ Like / Favorite | Save movies to Firestore, reflected in recommendations |
| 🤖 Hybrid Recommendations | Genre + keyword + cast similarity + user history scoring |
| 🔍 Live Search | Debounced search proxied through backend |
| 🎬 Movie Detail + Trailer | Full details, YouTube trailer embed |
| 📺 Watch Providers | Stream/rent/buy info (Netflix, Prime, etc.) from TMDB |
| 📅 Daily Top Picks | Personalized daily feed cached in Firestore |
| 🌍 Region Trending | Trending by country or global |
| 🧠 Taste Profile | Visual analysis of your top genres, actors, preferred decade |
| 📑 Pagination | 20-per-page grid on home trending feed |
| 💾 Redis Cache | 6-hour server-side caching for all TMDB calls |

---

## Project Structure

```
reelpick/
├── backend/                  ← Express API server
│   ├── controllers/          ← Route handlers
│   │   ├── movieController.js
│   │   ├── searchController.js
│   │   ├── trendingController.js
│   │   ├── recommendationController.js
│   │   └── watchProviderController.js
│   ├── routes/               ← Express routers
│   │   ├── movies.js
│   │   ├── search.js
│   │   ├── trending.js
│   │   ├── recommendations.js
│   │   └── watchProviders.js
│   ├── services/
│   │   ├── tmdbService.js        ← All TMDB axios calls
│   │   ├── cacheService.js       ← ioredis wrapper (graceful fallback)
│   │   └── recommendationEngine.js  ← Hybrid scoring algorithm
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── apiResponse.js
│   ├── server.js             ← Entry point
│   ├── .env                  ← 🔒 NOT committed
│   └── .env.example
│
├── src/                      ← React frontend
│   ├── components/
│   │   ├── MovieCard.jsx     ← Lazy-loads posters
│   │   ├── Navbar.jsx        ← + Taste Profile link
│   │   ├── WatchProviders.jsx ← NEW — stream/rent/buy logos
│   │   ├── Login.jsx
│   │   └── OnboardingModal.jsx
│   ├── pages/
│   │   ├── Home.jsx          ← Trending + pagination
│   │   ├── Search.jsx        ← Backend search
│   │   ├── MovieDetails.jsx  ← + Watch Providers
│   │   ├── MadeForYou.jsx    ← Backend hybrid recs
│   │   ├── TopPicksToday.jsx ← Backend hybrid recs
│   │   ├── TasteProfile.jsx  ← NEW — genre bars, actors, decade
│   │   ├── YourPicks.jsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useWatchProviders.js
│   │   ├── useTasteProfile.js
│   │   └── usePagination.js
│   └── services/
│       ├── api.js            ← All backend calls (replaces tmdb.js calls)
│       ├── firebase.js
│       ├── likes.js
│       ├── history.js
│       └── tmdb.js           ← Kept for backward compat (no longer used by pages)
│
├── vercel.json               ← Frontend deployment config
├── render.yaml               ← Backend + Redis deployment config
└── README.md
```

---

## API Endpoints

All endpoints return `{ success: boolean, data: any }`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/movie/:id` | Movie details (credits, videos, recs, keywords) — **cached 6hr** |
| `GET` | `/api/search?q=&page=` | Multi-search movies, TV, people — **cached 6hr** |
| `GET` | `/api/trending?region=GLOBAL&page=1` | Trending movies by region — **cached 6hr** |
| `POST` | `/api/recommendations` | Hybrid personalized recommendations |
| `GET` | `/api/watch-providers/:id?region=IN` | Stream/rent/buy providers — **cached 6hr** |

### POST /api/recommendations — Request Body

```json
{
  "userId": "firebase_uid",
  "prefs": { "genres": [28, 18], "actors": [{"name": "Tom Hanks"}] },
  "liked": [ /* array of movie objects from Firestore */ ],
  "watchHistory": [ /* array of watched movie objects */ ],
  "maxResults": 20
}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `TMDB_BEARER` | TMDB v4 Read Access Token |
| `TMDB_API_KEY` | TMDB v3 API Key |
| `REDIS_URL` | Redis connection URL (default `redis://localhost:6379`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS (e.g. `https://reelpick.vercel.app`) |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend URL (e.g. `http://localhost:5000` or Render URL) |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Redis (optional — app falls back gracefully if unavailable)
  - Windows: [Memurai](https://www.memurai.com/) or Docker: `docker run -p 6379:6379 redis`
  - macOS/Linux: `brew install redis && redis-server`

### 1. Clone & install

```bash
git clone https://github.com/your-username/reelpick.git
cd reelpick

# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### 2. Configure environment

```bash
# Frontend — create .env.local
echo "REACT_APP_API_URL=http://localhost:5000" >> .env.local

# Backend — copy and fill in secrets
copy backend\.env.example backend\.env
# Edit backend\.env with your TMDB keys
```

### 3. Start services

```bash
# Terminal 1 — Backend
cd backend
npm run dev    # uses nodemon for auto-reload

# Terminal 2 — Frontend
cd ..
npm start
```

- Frontend:  http://localhost:3000
- Backend:   http://localhost:5000
- Health:    http://localhost:5000/api/health

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo in [Vercel dashboard](https://vercel.com/new)
3. Set env variable: `REACT_APP_API_URL` = `https://your-render-backend.onrender.com`
4. Deploy — `vercel.json` handles SPA routing automatically

### Backend + Redis → Render

1. Connect GitHub in [Render dashboard](https://render.com)
2. Use **"New Blueprint"** and select `render.yaml` — it provisions the web service + Redis
3. Set secret env vars in Render dashboard:
   - `TMDB_BEARER`
   - `TMDB_API_KEY`
   - `CLIENT_ORIGIN` = your Vercel frontend URL
4. Deploy

---

## Recommendation Engine

The hybrid engine (`backend/services/recommendationEngine.js`) scores each candidate movie:

| Signal | Points | Source |
|---|---|---|
| Genre match (user prefs) | +1.5 per genre | Onboarding preferences |
| Favourite actor appears | +2 per actor | Onboarding + past movies |
| Favourite director | +2.5 | Onboarding |
| Language match | +1 | Onboarding |
| Genre overlap with liked movies | +0.8 per genre | Firestore `userLikes` |
| Keyword overlap with liked movies | +0.4 per keyword | TMDB keywords |
| Cast overlap with liked movies | +0.6 per actor | Firestore `userLikes` |
| Genre overlap with watch history | +0.4 per genre | Firestore `watchHistory` |
| Already watched penalty | −5 | Firestore `watchHistory` |
| Already liked penalty | −3 | Firestore `userLikes` |
| Popularity (capped at 2) | 0–2 | TMDB popularity score |
| Vote average boost | 0–1.5 | TMDB vote_average |
| Released in last 90 days | +1.2 | release_date |
| Released in last 365 days | +0.7 | release_date |
| Daily hash offset | ±0.3 | userId + date (for variety) |

---

## Screenshots

_Add screenshots here after deployment_

- Home — trending grid with pagination
- Movie Detail — with Watch Providers section
- Taste Profile — genre bars, actors, decade badge
- Made For You — hybrid recommendations
