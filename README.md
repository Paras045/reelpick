🎬 ReelPick — Smart Movie & Series Recommender

ReelPick is a personalized movie & TV recommendation app built with React + Firebase + TMDB API.
It recommends content based on your preferences, likes, and engagement — similar to Spotify’s “Made For You”, but for films 🎥

🚀 Features
🔐 Authentication

✔ Google Login using Firebase Authentication
✔ Secure user sessions
✔ Logout support

❤️ Likes & Favorites

✔ Save movies you like
✔ View all your liked movies in Your Picks
✔ Syncs in realtime with Firestore

🔍 Search

✔ Live search suggestions (Google-style)
✔ Keyboard navigation
✔ Click to open movie detail page

🎥 Movie Details

✔ Overview, cast, trailer (autoplay muted)
✔ Recommended titles
✔ Clean responsive UI

🎯 Personalized Recommendations

✔ “Made For You” page
✔ Based on your preferences & likes
✔ Explainable scoring system

🌞 Daily Feed — Top Picks Today

✔ Deterministic daily recommendations
✔ Updates every day
✔ Cached per-user

🇮🇳 Region-Aware Trending

✔ View what’s trending globally or by country

🛠 Tech Stack

Frontend

React

React Router

Axios

Backend

Firebase Authentication

Cloud Firestore

Data

TMDB API

🔧 Installation & Setup (Local)
1️⃣ Clone the Repo
git clone https://github.com/YOUR_USERNAME/ReelPick.git
cd ReelPick

2️⃣ Install Dependencies
npm install

🎬 TMDB API Setup

Create a TMDB account → generate:

✔ API Key (v3)
✔ Read Access Token (v4)

Create a .env.local file in the root of your project:

REACT_APP_TMDB_API_KEY=your_v3_api_key_here
REACT_APP_TMDB_BEARER=your_v4_token_here


⚠ Do NOT commit .env.local
(It should already be in .gitignore)

🔥 Firebase Setup (Authentication + Firestore ONLY)
1️⃣ Create Firebase Project

https://console.firebase.google.com/

2️⃣ Enable Authentication

Go to
Build → Authentication → Sign-in method

Enable:
✔ Google Sign-in

3️⃣ Create Firestore Database

Go to
Build → Firestore Database

Choose:
✔ Start in production mode
✔ Set region

4️⃣ Add Web App

Go to
Project Settings → General → Your Apps → Web

Copy the config — it looks like this:

const firebaseConfig = {
  apiKey: "XXXX",
  authDomain: "XXXX.firebaseapp.com",
  projectId: "XXXX",
  storageBucket: "XXXX.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

5️⃣ Paste config into:

src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "XXXX",
  authDomain: "XXXX.firebaseapp.com",
  projectId: "XXXX",
  storageBucket: "XXXX.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

▶️ Run the App
npm start


App runs at:
http://localhost:3000

🧠 Firestore Collections Used
userLikes/
userPreferences/
recommendationsCache/
watchHistory/   (planned)

🔒 Security Notes

🚫 Do NOT hard-code API keys
🚫 Do NOT commit .env.local
🚫 Do NOT expose Firebase Admin SDK in frontend

🛣 Roadmap

🔲 Spotify-style onboarding (fav actors/directors)
🔲 Cast-based recommendations
🔲 Gemini-powered taste modeling (server-side only)
🔲 Multi-profile support
🔲 Watch history tracking

🤝 Contributing

Pull requests welcome ✨
Open an issue for feature requests / bugs.

⭐ Support

If you like this project — star the repo ⭐
It helps more than you think 🙂
