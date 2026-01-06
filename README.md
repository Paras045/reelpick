🎬 ReelPick — Smart Movie & Series Recommender

ReelPick is a modern movie & TV discovery platform powered by React + TMDB + Firebase + personalization.

It doesn’t just show trailers — it learns your taste and builds recommendations for you.

🚀 Features
🔍 Discovery

✓ Trending (Global + Country-based)
✓ Live search suggestions
✓ Genre browsing
✓ Movie & Series pages

❤️ Personalisation

✓ Like / Unlike movies
✓ Save your picks
✓ First-time taste onboarding
✓ “Made For You” page
✓ “Top Picks Today” — updates daily

🎥 Movie Details

✓ Autoplay muted trailer
✓ Cast info
✓ Recommended titles
✓ Fallback when no trailer exists

🌎 Trending By Region

✓ Select country from dropdown
✓ India / USA / UK / Japan / Korea / France / Germany / Global
✓ Results refresh instantly

🔐 Auth + Storage

✓ Firebase Google Sign-In
✓ Likes & Preferences stored per-user
✓ Realtime updates

🛠️ Tech Stack

React + React Router

Firebase Hosting / Firestore / Auth

TMDB API

Axios

Debounced search

Minimal clean UI

📦 Local Setup
1️⃣ Clone
git clone https://github.com/YOUR_USERNAME/ReelPick.git
cd ReelPick

2️⃣ Install deps
npm install

3️⃣ Create .env.local

👉 Only TMDB goes here. Do NOT put Firebase keys.

REACT_APP_TMDB_API_KEY=YOUR_V3_KEY
REACT_APP_TMDB_BEARER=YOUR_V4_TOKEN


🔥 Tip: Never commit this file.

4️⃣ Run dev server
npm start


App → http://localhost:3000/

☁️ Deploying to Firebase

Build:

npm run build


Deploy:

firebase deploy

🧠 Important

Your firebaseConfig stays in code (React-side), like every normal Firebase web app.
Just don’t commit .env.local, and you’re solid.

Also make sure:

"rewrites": [
  { "source": "**", "destination": "/index.html" }
]


Otherwise React Router = white screen 💀

🧾 Data Model
Firestore Collections
userPreferences/{uid}
userLikes/{uid_movieId}
recommendationsCache/{uid}
watchHistory/{uid}

🎯 Recommendation Logic (Explainable)

ReelPick scores movies based on:

✔ Fav actors
✔ Fav directors
✔ Fav writers
✔ Genres
✔ Language
✔ Popularity
✔ Recency
✔ Daily stable randomness

So it’s predictable — not random nonsense.

🌍 Country Trending

Global:

/trending/movie/week


Country:

/discover/movie?with_origin_country=IN


More regions supported.

🧪 QA

Run automated UI tests:

node tests/qa.js


Covers routing / search / details / fallback / errors.

🔐 Security Notes

❌ Do NOT put Firebase keys in .env.local
✔ Firebase Web SDK keys are public — that’s normal
✔ TMDB keys should stay in .env.local

If you ever add AI (Gemini etc) — run it server-side only

⭐ Future Upgrades

Cloud-generated recs

Gemini taste learning

Watch history timeline

Advanced mood filters

Better mobile UI

💜 Credits

Movie data — TMDB
Hosting + Auth — Firebase
