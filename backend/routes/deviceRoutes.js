const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const UserDevice = require('../models/UserDevice');
const HealthData = require('../models/HealthData');
const authMiddleware = require('../config/authMiddleware');
const deviceAuth = require('../middleware/deviceAuth');
const { deviceLimiter } = require('../middleware/rateLimiter');
const { logAudit } = require('../services/auditService');
const logger = require('../utils/logger');
const { analyzeUserHealth } = require('../services/healthService');

// 1. POST /api/device/register
// Register device on startup
router.post('/register', deviceLimiter, deviceAuth, async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

    // Find or create device (do not overwrite existing)
    let device = await Device.findOne({ deviceId });
    if (!device) {
      device = new Device({ deviceId, status: 'offline', lastSeen: new Date() });
      await device.save();

      await logAudit({
        userId: 'DEVICE_' + deviceId,
        action: 'IOT_DEVICE_REGISTERED',
        req,
        details: { deviceId }
      });

      return res.status(201).json({ message: "Device registered", device });
    }
    
    res.json({ message: "Device already registered", device });
  } catch (err) {
    logger.error('[Device Register Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/device/data
// Ingest real-time sensor feed from ESP32
router.post('/data', deviceLimiter, deviceAuth, async (req, res) => {
  try {
    const { deviceId, heartRate, spo2, temperature, timestamp } = req.body;
    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

    // Validation Rules for physiological ranges
    const isValidHR = heartRate === null || (typeof heartRate === 'number' && heartRate >= 30 && heartRate <= 220);
    const isValidSpO2 = spo2 === null || (typeof spo2 === 'number' && spo2 >= 50 && spo2 <= 100);
    const isValidTemp = temperature === null || (typeof temperature === 'number' && temperature >= 30 && temperature <= 45);

    if (!isValidHR || !isValidSpO2 || !isValidTemp) {
      return res.status(400).json({ error: "Invalid physiological sensor data ranges (HR: 30-220 bpm, SpO2: 50-100%, Temp: 30-45°C)" });
    }

    // Timestamp sanity: reject future timestamps > 5 mins ahead
    if (timestamp) {
      const recordTime = new Date(timestamp).getTime();
      const now = Date.now();
      if (recordTime > now + 5 * 60 * 1000) {
        return res.status(400).json({ error: "Sensor timestamp cannot be in the future." });
      }
    }

    // 1. Update/Create Device status (Auto-registration)
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { status: 'online', lastSeen: new Date() },
      { upsert: true, new: true }
    );

    try {
      // 2. Find associated user and save health data
      let linkedUserId = req.user ? req.user.id : null;
      if (!linkedUserId) {
        const mapping = await UserDevice.findOne({ deviceId });
        if (mapping) linkedUserId = mapping.userId;
      }

      if (linkedUserId && (heartRate !== null || spo2 !== null)) {
        const newHealthRecord = new HealthData({
          userId: linkedUserId,
          deviceId: deviceId,
          heartRate: heartRate || 0,
          spo2: spo2 || 0,
          temperature: temperature || 36.5,
          createdAt: timestamp ? new Date(timestamp) : new Date()
        });
        await newHealthRecord.save();
        logger.info(`[IoT] Saved data for User: ${linkedUserId} via Device: ${deviceId}`);
        
        // 3. Trigger ASYNC intelligent analysis (Non-blocking)
        analyzeUserHealth(linkedUserId, { heartRate, spo2, temperature }, deviceId)
          .catch(err => logger.error("[IoT] Analysis Background Error:", { error: err.message }));

      } else if (!linkedUserId) {
        logger.debug(`[IoT] Data received for unmapped Device: ${deviceId}`);
      }
    } catch (saveErr) {
      logger.error("[IoT] Database Save Error:", { error: saveErr.message });
    }
    
    res.json({ message: "Status updated and data processed", device });
  } catch (err) {
    logger.error("Device data global error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/device
// List all registered devices
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find().sort({ lastSeen: -1 }).limit(100);
    res.json(devices);
  } catch (err) {
    logger.error('[Device List Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/device/connect
// Map a user to a device
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const { userId, deviceId } = req.body;
    const targetUserId = userId || req.user.id;

    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

    // Object level authorization check
    if (req.user.id !== targetUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized to map devices for another user." });
    }

    const mapping = await UserDevice.findOneAndUpdate(
      { userId: targetUserId, deviceId },
      { userId: targetUserId, deviceId },
      { upsert: true, new: true }
    );

    res.json({ message: "Device connected to user", mapping });
  } catch (err) {
    logger.error('[Device Connect Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// 5. GET /api/device/:userId
// Fetch latest health readings for a specific user (Protected with IDOR validation)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Safety check: Ensure the requester is viewing their own data
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const limit = parseInt(req.query.limit, 10) || 20;

    const data = await HealthData.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Format for Dashboard: reverse for chart (oldest to newest)
    const formattedData = data.map(record => ({
      heart_rate: record.heartRate,
      spo2: record.spo2,
      temperature: record.temperature,
      timestamp: record.createdAt.toISOString()
    })).reverse();

    res.json(formattedData);
  } catch (err) {
    logger.error('[Device GetUserHealth Error]:', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
