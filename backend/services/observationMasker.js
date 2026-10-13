/**
 * Observation Masking Engine (Stage 3 of 8-stage IEEE Architecture)
 * 
 * Distinct from Signal Quality Assessment:
 * Stage 2 evaluates the continuous quality metrics (SQI: 0.00 - 1.00).
 * Stage 3 generates the binary observation mask M_c in {0, 1} for each channel:
 *   - 1 = Observed (telemetry is present, physiologically plausible, and SQI is acceptable)
 *   - 0 = Missing / Unreliable (sample dropped, out of bounds, sensor detached, or severe artifact)
 * 
 * This binary observation mask is passed to CSDI (Stage 4) for conditional diffusion imputation.
 */

const { BOUNDS } = require('./signalQualityEngine');

/**
 * Generate binary observation mask for vital channels
 * @param {Object} vitals - Current vitals frame { heartRate, spo2, temperature }
 * @param {Object} sqiResult - Result from signalQualityEngine
 * @returns {Object} Binary observation mask and masking rationale
 */
function generateObservationMask(vitals = {}, sqiResult = {}) {
  const mask = {
    heartRate: 0,
    spo2: 0,
    temperature: 0
  };

  const rationale = {
    heartRate: 'Missing/unobserved',
    spo2: 'Missing/unobserved',
    temperature: 'Missing/unobserved'
  };

  const isSensorDetached = sqiResult.factors?.opticalSensorContact === false;

  // Heart Rate Masking
  const hr = Number(vitals.heartRate);
  if (!isNaN(hr) && hr > 0 && !isSensorDetached) {
    if (hr >= BOUNDS.heartRate.min && hr <= BOUNDS.heartRate.max) {
      mask.heartRate = 1;
      rationale.heartRate = 'Observed (Valid optical PPG detection)';
    } else {
      mask.heartRate = 0;
      rationale.heartRate = `Unreliable (Out of bounds: ${hr} BPM)`;
    }
  } else {
    mask.heartRate = 0;
    rationale.heartRate = isSensorDetached ? 'Missing (Optical decoupling)' : 'Missing (No signal detected)';
  }

  // SpO2 Masking
  const spo2 = Number(vitals.spo2);
  if (!isNaN(spo2) && spo2 > 0 && !isSensorDetached) {
    if (spo2 >= BOUNDS.spo2.min && spo2 <= BOUNDS.spo2.max) {
      mask.spo2 = 1;
      rationale.spo2 = 'Observed (Valid optical reflectance)';
    } else {
      mask.spo2 = 0;
      rationale.spo2 = `Unreliable (Out of bounds: ${spo2}%)`;
    }
  } else {
    mask.spo2 = 0;
    rationale.spo2 = isSensorDetached ? 'Missing (Optical decoupling)' : 'Missing (No signal detected)';
  }

  // Temperature Masking
  const temp = Number(vitals.temperature);
  if (!isNaN(temp) && temp > 0) {
    if (temp >= BOUNDS.temperature.min && temp <= BOUNDS.temperature.max) {
      mask.temperature = 1;
      rationale.temperature = 'Observed (Valid DS18B20 measurement)';
    } else {
      mask.temperature = 0;
      rationale.temperature = `Unreliable (Out of bounds: ${temp}°C)`;
    }
  } else {
    mask.temperature = 0;
    rationale.temperature = 'Missing (No temperature telemetry detected)';
  }

  // Calculate missingness ratio
  const totalChannels = 3;
  const observedChannels = mask.heartRate + mask.spo2 + mask.temperature;
  const missingnessRatio = Number(((totalChannels - observedChannels) / totalChannels).toFixed(2));

  return {
    mask, // { heartRate: 1/0, spo2: 1/0, temperature: 1/0 }
    observedChannels,
    totalChannels,
    missingnessRatio,
    rationale,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateObservationMask
};
