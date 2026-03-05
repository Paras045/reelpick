const Redis = require('ioredis');
require('dotenv').config();

const SIX_HOURS = 60 * 60 * 6; // seconds

let client = null;
let connected = false;

function getClient() {
  if (client) return client;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  client = new Redis(url, {
    // ioredis: do not retry forever — give up after 3 attempts
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
    connectTimeout: 3000,
  });

  client.on('connect', () => {
    connected = true;
    console.log('✅ Redis connected');
  });

  client.on('error', (err) => {
    if (connected) {
      console.warn('⚠️  Redis error — falling back to no-cache mode:', err.message);
    }
    connected = false;
  });

  client.connect().catch(() => {
    console.warn('⚠️  Redis unavailable — caching disabled, falling back to direct TMDB calls');
    connected = false;
  });

  return client;
}

/**
 * Get a cached value. Returns parsed JSON or null if missing/unavailable.
 */
async function get(key) {
  try {
    const c = getClient();
    if (!connected) return null;
    const val = await c.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with optional TTL in seconds (default 6 hours).
 */
async function set(key, data, ttl = SIX_HOURS) {
  try {
    const c = getClient();
    if (!connected) return;
    await c.set(key, JSON.stringify(data), 'EX', ttl);
  } catch {
    // silent — cache failures must never crash the app
  }
}

/**
 * Delete a key (e.g. for cache invalidation).
 */
async function del(key) {
  try {
    const c = getClient();
    if (!connected) return;
    await c.del(key);
  } catch {
    // silent
  }
}

module.exports = { get, set, del, SIX_HOURS };
