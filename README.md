# ReelPick 🍿

A modern movie discovery and recommendation web app built with React, powered by The Movie Database (TMDB) API and Firebase for authentication and data storage.

## Features

- **Movie Discovery**: Browse popular, trending, and top-rated movies
- **User Authentication**: Sign up and log in with Firebase Authentication
- **Like/Unlike Movies**: Toggle likes on movies with real-time Firestore integration
- **Personalized Recommendations**: Get movie suggestions based on your liked movies
- **Search Functionality**: Find movies by title or genre
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Frontend**: React.js with Hooks
- **Backend**: Firebase (Authentication, Firestore)
- **API**: The Movie Database (TMDB) API
- **Styling**: CSS with modern design patterns
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TMDB API key (get one from [TMDB](https://www.themoviedb.org/settings/api))
- Firebase project setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reelpick.git
   cd reelpick
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your API keys:
   ```
   VITE_TMDB_KEY=your_tmdb_api_token_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MovieCard.jsx    # Movie display card with like functionality
│   ├── Login.jsx        # Authentication component
│   └── Navbar.jsx       # Navigation bar
├── pages/               # Page components
│   ├── Home.jsx         # Main movie browsing page
│   ├── MovieDetails.jsx # Individual movie details
│   ├── Profile.jsx      # User profile page
│   └── Search.jsx       # Movie search page
├── services/            # API and utility services
│   ├── firebase.js      # Firebase configuration
│   ├── likes.js         # Like/unlike functionality
│   ├── recommend.js     # Recommendation logic
│   └── tmdb.js          # TMDB API integration
├── context/             # React context providers
└── App.js               # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing movie data
- [Firebase](https://firebase.google.com/) for backend services
- [Create React App](https://create-react-app.dev/) for the project boilerplate
