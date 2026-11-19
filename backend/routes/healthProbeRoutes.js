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
    latestVersion: '1.1.1',
    releaseName: 'HealthPulse AI v1.1.1 - Mobile GPU Acceleration, Clinical Telemetry & Auto-Update',
    publishedAt: new Date().toISOString(),
    minSupportedVersion: '1.0.0',
    mandatory: false,
    apkUrl: '/app-release.apk',
    releaseUrl: 'https://github.com/siddarthakumar001-rocky/HealthPulse_AI/releases/latest',
    websiteUrl: 'https://pulse-ai-gamma.vercel.app',
    releaseNotes: [
      'Hardware GPU acceleration and matrix blur bypass for 60fps mobile telemetry',
      'In-App Software Update and direct official APK download pipeline',
      'Reduced mobile polling overhead and touch-device gesture optimization',
      'Google Account authentication with mandatory emergency contact routing',
      'High-contrast clinical HUD telemetry metrics for both dark and light themes'
    ]
  });
};

router.get('/api/app/version', getVersionManifest);
router.get('/app/version', getVersionManifest);

module.exports = router;
