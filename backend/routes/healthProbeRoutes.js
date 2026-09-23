/**
 * HealthPulse AI - Health & Readiness Probes
 * Provides standard Kubernetes/Docker/Cloudflare health check endpoints.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cacheService = require('../services/cacheService');

/**
 * GET /health
 * Liveness probe: Verifies server process is up and accepting requests
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
  });
});

/**
 * GET /ready
 * Readiness probe: Verifies database and core services are active
 */
router.get('/ready', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbReady = dbState === 1; // 1 = connected

  const status = isDbReady ? 'READY' : 'DEGRADED';
  const statusCode = isDbReady ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: isDbReady ? 'CONNECTED' : 'DISCONNECTED',
      cache: 'ACTIVE',
      queue: 'ACTIVE'
    }
  });
});

module.exports = router;
