const HealthData = require('../models/HealthData');

/**
 * Fetch latest health records for the logged-in user
 */
exports.getHealthData = async (req, res) => {
  try {
    const userId = req.user.id;
    // Return latest 20 records, sorted by time descending, then reversed for the chart
    const data = await HealthData.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Map to the format the frontend expects (heart_rate, spo2, temperature, timestamp)
    const formattedData = data.map(record => ({
      heart_rate: record.heartRate,
      spo2: record.spo2,
      temperature: record.temperature,
      timestamp: record.createdAt.toISOString()
    })).reverse();

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching health data:", err);
    res.status(500).json({ error: "Failed to fetch health data" });
  }
};

/**
 * Save sensor data from ESP32
 */
exports.saveHealthData = async (req, res) => {
  try {
    const { userId, heartRate, spo2, temperature } = req.body;

    if (!userId || heartRate === undefined || spo2 === undefined || temperature === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRecord = new HealthData({
      userId,
      heartRate,
      spo2,
      temperature
    });

    await newRecord.save();
    res.status(201).json({ message: "Data saved successfully", record: newRecord });
  } catch (err) {
    console.error("Error saving health data:", err);
    res.status(500).json({ error: "Failed to save health data" });
  }
};

const { assessSignalQuality } = require('../services/signalQualityEngine');
const { generateObservationMask } = require('../services/observationMasker');
const { reconstructTelemetry } = require('../services/reconstructionEngine');
const { evaluateContextSafety } = require('../services/contextSentinel');
const { PROVENANCE_TYPES } = require('../services/provenanceEngine');

/**
 * GET /api/health/current
 * Return latest verified vitals, SQI, activity, provenance, and context risk evaluation
 */
exports.getHealthCurrent = async (req, res) => {
  try {
    const userId = req.user.id;
    const latestRecord = await HealthData.findOne({ userId }).sort({ createdAt: -1 });

    if (!latestRecord) {
      return res.json({
        status: 'AWAITING_TELEMETRY',
        message: 'Waiting for sensor data',
        vitals: null,
        signalQuality: { status: 'UNAVAILABLE', sqi: 0.0, category: 'UNAVAILABLE' },
        activity: { activity: 'Unavailable', confidence: 0, source: 'None' },
        provenance: PROVENANCE_TYPES.SENSOR,
        contextRisk: { severity: 'NORMAL', reason: 'Awaiting sensor telemetry' }
      });
    }

    const recentHistory = await HealthData.find({ userId }).sort({ createdAt: -1 }).limit(15);
    const vitals = {
      heartRate: latestRecord.heartRate,
      spo2: latestRecord.spo2,
      temperature: latestRecord.temperature,
      lastSeen: latestRecord.createdAt
    };

    const sqi = assessSignalQuality(vitals, recentHistory);
    const activityContext = {
      activity: latestRecord.activity || 'Resting',
      confidence: latestRecord.activityConfidence || (latestRecord.activity ? 92 : null),
      source: latestRecord.activity ? 'MPU6050 / IMU' : 'Activity detection unavailable'
    };

    const sentinelEval = evaluateContextSafety({
      vitals,
      activity: activityContext.activity,
      signalQuality: sqi,
      provenance: latestRecord.source === 'csdi_reconstructed' ? PROVENANCE_TYPES.CSDI_RECONSTRUCTED : PROVENANCE_TYPES.SENSOR,
      persistenceSeconds: 15,
      baselineMlRisk: 'LOW',
      history: recentHistory
    });

    res.json({
      status: 'ACTIVE',
      vitals: {
        heartRate: vitals.heartRate,
        spo2: vitals.spo2,
        temperature: vitals.temperature,
        timestamp: latestRecord.createdAt
      },
      provenance: latestRecord.source === 'csdi_reconstructed' ? PROVENANCE_TYPES.CSDI_RECONSTRUCTED : PROVENANCE_TYPES.SENSOR,
      signalQuality: sqi,
      activity: activityContext,
      contextRisk: sentinelEval
    });
  } catch (err) {
    console.error("Error fetching current health state:", err);
    res.status(500).json({ error: "Failed to fetch current health state" });
  }
};

/**
 * GET /api/health/signal-quality
 * Telemetry signal quality analysis
 */
exports.getSignalQuality = async (req, res) => {
  try {
    const userId = req.user.id;
    const latestRecord = await HealthData.findOne({ userId }).sort({ createdAt: -1 });
    const recentHistory = await HealthData.find({ userId }).sort({ createdAt: -1 }).limit(20);

    if (!latestRecord) {
      return res.json({
        status: 'UNAVAILABLE',
        sqi: 0.0,
        category: 'UNAVAILABLE',
        message: 'Signal quality unavailable — waiting for sensor telemetry'
      });
    }

    const sqi = assessSignalQuality(latestRecord, recentHistory);
    res.json(sqi);
  } catch (err) {
    console.error("Error evaluating signal quality:", err);
    res.status(500).json({ error: "Failed to evaluate signal quality" });
  }
};

/**
 * GET /api/health/activity
 * Classification and kinetic context
 */
exports.getActivityContext = async (req, res) => {
  try {
    const userId = req.user.id;
    const latestRecord = await HealthData.findOne({ userId }).sort({ createdAt: -1 });

    if (!latestRecord || !latestRecord.activity) {
      return res.json({
        status: 'UNAVAILABLE',
        activity: 'Activity detection unavailable',
        confidence: null,
        source: 'IMU data unavailable'
      });
    }

    res.json({
      status: 'AVAILABLE',
      activity: latestRecord.activity,
      confidence: latestRecord.activityConfidence || 94,
      source: 'MPU6050 / IMU',
      timestamp: latestRecord.createdAt
    });
  } catch (err) {
    console.error("Error fetching activity context:", err);
    res.status(500).json({ error: "Failed to fetch activity context" });
  }
};

/**
 * GET /api/health/reconstruction
 * CSDI reconstruction state & observation mask
 */
exports.getReconstructionState = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await HealthData.find({ userId }).sort({ createdAt: -1 }).limit(30);

    if (!records || records.length === 0) {
      return res.json({
        status: 'AWAITING_TELEMETRY',
        csdiStatus: 'MODEL_INTEGRATION_PENDING',
        message: 'Waiting for sensor telemetry',
        observedTelemetry: 'Unavailable',
        reconstructedTelemetry: 'Unavailable'
      });
    }

    const latest = records[0];
    const sqi = assessSignalQuality(latest, records);
    const observationMask = generateObservationMask(latest, sqi);
    const reconstruction = await reconstructTelemetry(records.reverse(), observationMask);

    res.json({
      observationMask,
      reconstruction
    });
  } catch (err) {
    console.error("Error fetching reconstruction state:", err);
    res.status(500).json({ error: "Failed to fetch reconstruction state" });
  }
};

