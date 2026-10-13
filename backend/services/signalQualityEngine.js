/**
 * Signal Quality Engine (Stage 2 of 8-stage IEEE Architecture)
 * 
 * Computes deterministic Signal Quality Index (SQI) between 0.00 and 1.00 based on:
 * - Physiological plausibility (HR: 30-220 bpm, SpO2: 60-100%, Temp: 32-43°C)
 * - Sample continuity & dropout rate
 * - Optical sensor contact / coupling (MAX30102 PPG sensor decoupling detection)
 * - Motion artifact noise estimation
 * - Waveform stability
 * 
 * Engineering thresholds (not clinically validated):
 * - GOOD: >= 0.80
 * - FAIR: 0.50 - 0.79
 * - POOR: < 0.50
 * 
 * Note: Uses "Optical sensor contact" / "Optical coupling" instead of "electrode contact"
 * since the MAX30102 is an optical photoplethysmography (PPG) sensor.
 */

// Physiological bounds for plausibility checks
const BOUNDS = {
  heartRate: { min: 30, max: 220, normalMin: 50, normalMax: 140 },
  spo2: { min: 60, max: 100, normalMin: 90, normalMax: 100 },
  temperature: { min: 32.0, max: 43.0, normalMin: 35.5, normalMax: 38.5 },
};

/**
 * Assess signal quality for a single telemetry frame or time series
 * @param {Object} vitals - Current vitals frame { heartRate, spo2, temperature, ppgRaw, imu, lastSeen }
 * @param {Array} history - Recent historical frames (up to 30s)
 * @returns {Object} SQI breakdown and categorization
 */
function assessSignalQuality(vitals = {}, history = []) {
  if (!vitals || (vitals.heartRate == null && vitals.spo2 == null && vitals.temperature == null)) {
    return {
      status: 'UNAVAILABLE',
      sqi: 0.0,
      category: 'UNAVAILABLE',
      factors: {
        signalContinuity: false,
        waveformStability: false,
        lowMotionArtifact: false,
        opticalSensorContact: false,
        physiologicalPlausibility: false,
      },
      message: 'Signal quality unavailable — waiting for sensor telemetry',
      timestamp: new Date().toISOString()
    };
  }

  const hr = Number(vitals.heartRate);
  const spo2 = Number(vitals.spo2);
  const temp = Number(vitals.temperature);

  // 1. Optical sensor contact / coupling
  // MAX30102 PPG detects finger detachment if SpO2 == 0 or HR == 0 or IR reflectance drops
  let opticalContact = true;
  if ((!isNaN(hr) && hr === 0) || (!isNaN(spo2) && spo2 === 0)) {
    opticalContact = false;
  }
  if (vitals.contactDetected === false || vitals.fingerDetected === false) {
    opticalContact = false;
  }

  // 2. Physiological plausibility
  let plausibilityScore = 1.0;
  let plausibleCount = 0;
  let totalChecked = 0;

  if (!isNaN(hr) && hr > 0) {
    totalChecked++;
    if (hr >= BOUNDS.heartRate.min && hr <= BOUNDS.heartRate.max) {
      plausibleCount++;
    }
  }
  if (!isNaN(spo2) && spo2 > 0) {
    totalChecked++;
    if (spo2 >= BOUNDS.spo2.min && spo2 <= BOUNDS.spo2.max) {
      plausibleCount++;
    }
  }
  if (!isNaN(temp) && temp > 0) {
    totalChecked++;
    if (temp >= BOUNDS.temperature.min && temp <= BOUNDS.temperature.max) {
      plausibleCount++;
    }
  }
  if (totalChecked > 0) {
    plausibilityScore = plausibleCount / totalChecked;
  } else {
    plausibilityScore = 0.0;
  }

  // 3. Signal continuity / Dropout rate (based on history)
  let continuityScore = 1.0;
  if (history && history.length >= 2) {
    const timestamps = history.map(h => new Date(h.timestamp || h.createdAt).getTime()).filter(t => !isNaN(t));
    if (timestamps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(Math.abs(timestamps[i] - timestamps[i - 1]));
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      // Expecting ~1000ms - 2000ms intervals. If avg interval > 5000ms, continuity suffers
      if (avgInterval > 5000) {
        continuityScore = Math.max(0.2, 1.0 - (avgInterval - 5000) / 10000);
      }
    }
  }

  // 4. Motion artifact estimation (from IMU if present)
  let lowMotionScore = 1.0;
  if (vitals.imu || vitals.accel) {
    const accel = vitals.imu?.accel || vitals.accel || {};
    const ax = accel.x || 0;
    const ay = accel.y || 0;
    const az = accel.z || 0;
    const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    // Standard gravity ~ 1.0g or 9.8m/s^2. Deviation indicates dynamic acceleration
    const dynamicMotion = Math.abs(magnitude > 5 ? magnitude - 9.8 : magnitude - 1.0);
    if (dynamicMotion > 1.5) {
      lowMotionScore = Math.max(0.3, 1.0 - (dynamicMotion / 5.0));
    }
  } else if (vitals.activity === 'Running' || vitals.activity === 'Exercise') {
    lowMotionScore = 0.70; // expected higher motion artifact during intense exertion
  }

  // 5. Waveform stability (variance check across history)
  let stabilityScore = 0.95;
  if (history && history.length >= 3) {
    const hrValues = history.map(h => Number(h.heartRate || h.vitals?.heartRate)).filter(v => !isNaN(v) && v > 0);
    if (hrValues.length >= 3) {
      // Calculate standard deviation of consecutive differences
      const diffs = [];
      for (let i = 1; i < hrValues.length; i++) {
        diffs.push(Math.abs(hrValues[i] - hrValues[i - 1]));
      }
      const maxDiff = Math.max(...diffs);
      // Sudden unphysiological jump between consecutive frames (e.g. > 30 bpm jump in 1s)
      if (maxDiff > 30) {
        stabilityScore = 0.60;
      }
    }
  }

  // If optical contact is lost, overall SQI drops drastically
  if (!opticalContact) {
    return {
      status: 'POOR',
      sqi: 0.15,
      category: 'POOR',
      factors: {
        signalContinuity: continuityScore >= 0.7,
        waveformStability: false,
        lowMotionArtifact: lowMotionScore >= 0.7,
        opticalSensorContact: false,
        physiologicalPlausibility: false,
      },
      message: 'Optical sensor decoupling detected — check MAX30102 placement on finger/wrist',
      timestamp: new Date().toISOString()
    };
  }

  // Weighted composite SQI calculation
  const compositeSqi = Number((
    (plausibilityScore * 0.35) +
    (continuityScore * 0.20) +
    (lowMotionScore * 0.20) +
    (stabilityScore * 0.25)
  ).toFixed(2));

  let category = 'GOOD';
  if (compositeSqi < 0.50) {
    category = 'POOR';
  } else if (compositeSqi < 0.80) {
    category = 'FAIR';
  }

  return {
    status: category,
    sqi: Math.min(1.0, Math.max(0.0, compositeSqi)),
    category,
    factors: {
      signalContinuity: continuityScore >= 0.7,
      waveformStability: stabilityScore >= 0.7,
      lowMotionArtifact: lowMotionScore >= 0.7,
      opticalSensorContact: true,
      physiologicalPlausibility: plausibilityScore >= 0.8,
    },
    message: category === 'GOOD' 
      ? 'Optimal physiological telemetry quality' 
      : category === 'FAIR' 
      ? 'Moderate signal quality — potential minor motion or contact variation'
      : 'Degraded signal quality — verify optical coupling and motion state',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  assessSignalQuality,
  BOUNDS
};
