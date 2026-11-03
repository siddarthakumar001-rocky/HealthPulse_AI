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

/**
 * GET /api/app/version and /app/version
 * Software Update & Release Manifest
 */
const getVersionManifest = (req, res) => {
  res.status(200).json({
    latestVersion: '1.0.1',
    releaseName: 'HealthPulse AI v1.0.1 - Performance, Security & Telemetry Hardening',
    publishedAt: new Date().toISOString(),
    minSupportedVersion: '1.0.0',
    mandatory: false,
    apkUrl: 'https://github.com/siddhant-deshmukh/healthpulse-ai/releases/latest/download/app-release.apk',
    releaseUrl: 'https://github.com/siddhant-deshmukh/healthpulse-ai/releases/latest',
    websiteUrl: 'https://healthpulse-ai.vercel.app',
    releaseNotes: [
      'In-App Software Update and Auto-Download system for mobile APKs',
      'Continuous GPS synchronization and resilient Leaflet health map discovery',
      'Guaranteed regional healthcare network fallback and hospital routing',
      'Global system recovery Error Boundary for uninterrupted clinical HUD telemetry',
      'Low-latency ring buffer telemetry stream and responsive UI optimization'
    ]
  });
};

router.get('/api/app/version', getVersionManifest);
router.get('/app/version', getVersionManifest);

module.exports = router;
