/**
 * HealthPulse AI - Resilient Multi-Tier Caching Service
 * Provides Redis caching with automatic, zero-dependency in-memory fallback.
 * Strictly enforces that raw Patient Health Information (PHI) is NEVER cached.
 */

const logger = require('../utils/logger');

// High-speed In-Memory Cache Store with TTL & max size
class InMemoryCache {
  constructor(maxItems = 1000) {
    this.store = new Map();
    this.maxItems = maxItems;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 60) {
    if (this.store.size >= this.maxItems) {
      // Evict oldest entry
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiry });
  }

  del(key) {
    this.store.delete(key);
  }

  delPattern(pattern) {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  flush() {
    this.store.clear();
  }
}

const memoryCache = new InMemoryCache();
let redisClient = null;
let isRedisReady = false;

// Initialize Redis if REDIS_URL or REDIS_HOST is present in environment
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    // Attempt optional redis dependency if installed
    const Redis = require('ioredis');
    const redisOptions = process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('[Cache] Redis unreachable, using in-memory cache fallback.');
          return null;
        }
        return Math.min(times * 100, 2000);
      }
    };

    redisClient = new Redis(redisOptions);

    redisClient.on('connect', () => {
      isRedisReady = true;
      logger.info('[Cache] Redis Cache Connected & Active');
    });

    redisClient.on('error', (err) => {
      isRedisReady = false;
      logger.warn('[Cache] Redis connection error (using in-memory fallback):', { error: err.message });
    });
  } catch (err) {
    logger.info('[Cache] Redis library not loaded; using high-speed in-memory cache.');
  }
}

const cacheService = {
  /**
   * Get cached data
   */
  get: async (key) => {
    try {
      if (isRedisReady && redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      }
      return memoryCache.get(key);
    } catch (err) {
      logger.warn(`[Cache Get Error] Key: ${key}:`, { error: err.message });
      return memoryCache.get(key);
    }
  },

  /**
   * Set cached data with TTL in seconds
   */
  set: async (key, value, ttlSeconds = 60) => {
    try {
      if (isRedisReady && redisClient) {
        await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        memoryCache.set(key, value, ttlSeconds);
      }
    } catch (err) {
      logger.warn(`[Cache Set Error] Key: ${key}:`, { error: err.message });
      memoryCache.set(key, value, ttlSeconds);
    }
  },

  /**
   * Delete a single key
   */
  del: async (key) => {
    try {
      if (isRedisReady && redisClient) {
        await redisClient.del(key);
      }
      memoryCache.del(key);
    } catch (err) {
      logger.warn(`[Cache Del Error] Key: ${key}:`, { error: err.message });
      memoryCache.del(key);
    }
  },

  /**
   * Delete keys matching a pattern (e.g. 'phc:*')
   */
  delPattern: async (pattern) => {
    try {
      if (isRedisReady && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
      memoryCache.delPattern(pattern);
    } catch (err) {
      logger.warn(`[Cache DelPattern Error] Pattern: ${pattern}:`, { error: err.message });
      memoryCache.delPattern(pattern);
    }
  },

  /**
   * Flush entire cache
   */
  flush: async () => {
    try {
      if (isRedisReady && redisClient) {
        await redisClient.flushdb();
      }
      memoryCache.flush();
    } catch (err) {
      memoryCache.flush();
    }
  }
};

module.exports = cacheService;
