require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ─── Route Imports ────────────────────────────────────────────────────────────
const moviesRouter = require('./routes/movies');
const searchRouter = require('./routes/search');
const trendingRouter = require('./routes/trending');
const recommendationsRouter = require('./routes/recommendations');
const watchProvidersRouter = require('./routes/watchProviders');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://reelpick-584c5.web.app',
  process.env.CLIENT_ORIGIN
].filter(Boolean);


  app.use(morgan('dev'));
}

// Rate limiting — 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please slow down.' },
});
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/movie', moviesRouter);
app.use('/api/search', searchRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/watch-providers', watchProvidersRouter);

// Diagnostic: Check TMDB connectivity
app.get('/api/diag/tmdb', async (req, res) => {
  const { getPopularMovies } = require('./services/tmdbService');
  try {
    const test = await getPopularMovies(1);
    res.json({ success: true, message: 'TMDB connectivity OK', data: { results_count: test.data.results?.length } });
  } catch (err) {
    res.status(502).json({ 
      success: false, 
      message: 'TMDB connectivity FAILED', 
      error: err.message,
      details: err.response?.data || 'No response data'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ReelPick backend is running 🎬', time: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>ReelPick Backend 🎬</h1>
    <p>Status: Running</p>
    <ul>
      <li><a href="/api/health">/api/health</a></li>
      <li><a href="/api/diag/tmdb">/api/diag/tmdb</a></li>
    </ul>
  `);
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);

  // TMDB API errors
  if (err.response) {
    const status = err.response.status;
    const msg = err.response.data?.status_message || 'TMDB API error';
    return res.status(status === 401 ? 401 : 502).json({
      success: false,
      error: status === 401 ? 'Invalid TMDB credentials' : msg,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message || 'Unknown error'
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ReelPick backend running on http://localhost:${PORT}`);
  console.log(`   TMDB key configured: ${!!process.env.TMDB_BEARER || !!process.env.TMDB_API_KEY}`);
  console.log(`   Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379 (default)'}`);
});

module.exports = app;
