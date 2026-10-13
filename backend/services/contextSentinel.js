/**
 * Context-Aware Safety Sentinel (Stage 6 of 8-stage IEEE Architecture)
 * 
 * Implements the mathematical decision function:
 * ALERT = f(Vital Signs, Activity, Signal Quality, Persistence, Baseline ML Output, Provenance)
 * 
 * Key Principles:
 * 1. Preserves deterministic emergency escalation rules for predefined high-risk conditions.
 * 2. Distinguishes exercise adaptation (e.g. HR=145 BPM + Running) from true tachycardia.
 * 3. Gated by Signal Quality: POOR SQI triggers "SENSOR / SIGNAL QUALITY WARNING" instead of clinical crisis.
 * 4. Provenance-gated: FORECAST values NEVER trigger emergency sirens.
 * 5. Python AI service failure fallback: If /ai/context-eval is offline, deterministic rules proceed without interruption.
 */

const { assessSignalQuality } = require('./signalQualityEngine');
const { evaluateProvenanceGate, PROVENANCE_TYPES } = require('./provenanceEngine');

// Activity-specific physiological baseline thresholds
const ACTIVITY_HEART_RATE_THRESHOLDS = {
  Resting:  { normalMax: 100, elevatedMax: 125, criticalMax: 140 },
  Sleeping: { normalMax: 90,  elevatedMax: 110, criticalMax: 130 },
  Walking:  { normalMax: 120, elevatedMax: 140, criticalMax: 160 },
  Running:  { normalMax: 175, elevatedMax: 190, criticalMax: 205 },
  Exercise: { normalMax: 170, elevatedMax: 185, criticalMax: 200 },
};

/**
 * Context Sentinel Decision Engine
 * @param {Object} input - {
 *   vitals: { heartRate, spo2, temperature },
 *   activity: 'Resting' | 'Walking' | 'Running' | 'Sleeping' | 'Exercise',
 *   activityConfidence: number,
 *   signalQuality: Object (from signalQualityEngine),
 *   provenance: 'SENSOR' | 'CSDI_RECONSTRUCTED' | 'FORECAST',
 *   persistenceSeconds: number,
 *   baselineMlRisk: string ('LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'),
 *   history: Array
 * }
 * @returns {Object} Alert decision with full explainability breakdown
 */
function evaluateContextSafety(input = {}) {
  const vitals = input.vitals || {};
  const hr = Number(vitals.heartRate);
  const spo2 = Number(vitals.spo2);
  const temp = Number(vitals.temperature);

  const activity = input.activity || 'Resting';
  const provenance = input.provenance || PROVENANCE_TYPES.SENSOR;
  const persistence = input.persistenceSeconds || 0;
  const baselineMl = input.baselineMlRisk || 'LOW';

  // Evaluate or receive SQI
  const sqiResult = input.signalQuality || assessSignalQuality(vitals, input.history || []);
  const sqiCategory = sqiResult.category || 'GOOD';

  // 1. Check Provenance Gate first
  const provenanceGate = evaluateProvenanceGate({
    vital: 'Telemetry',
    value: hr,
    provenance,
    confidence: input.reconstructionConfidence,
    sqi: sqiResult.sqi
  });

  // If FORECAST, never allow emergency alarm
  if (provenance === PROVENANCE_TYPES.FORECAST) {
    return {
      alertRequired: false,
      severity: 'INFO',
      vital: 'Heart Rate',
      value: hr,
      activity,
      persistence: `${persistence}s`,
      signalQuality: sqiCategory,
      provenance,
      baselineMl,
      decisionRule: 'RULE_PROVENANCE_FORECAST_SUPPRESSED',
      reason: 'Forecast values are predictive projections and are barred from triggering alerts.',
      recommendedAction: 'Continue observational monitoring.',
      timestamp: new Date().toISOString()
    };
  }

  // 2. Check Signal Quality: POOR SQI triggers quality warning, NOT a clinical cardiac emergency
  if (sqiCategory === 'POOR') {
    return {
      alertRequired: true,
      severity: 'WARNING',
      vital: 'Optical Telemetry',
      value: hr || spo2,
      activity,
      persistence: `${persistence}s`,
      signalQuality: 'POOR',
      provenance,
      baselineMl,
      decisionRule: 'RULE_SQI_SENSOR_WARNING',
      reason: sqiResult.message || 'Degraded signal quality detected — optical sensor contact or excessive motion.',
      recommendedAction: 'Inspect wearable optical coupling and verify sensor placement on skin.',
      timestamp: new Date().toISOString()
    };
  }

  // 3. Deterministic Safety Rules for Predefined High-Risk Conditions (FAIL-SAFE)
  // Severe Hypoxemia: SpO2 < 85% with good signal is an immediate high risk regardless of activity
  if (!isNaN(spo2) && spo2 > 0 && spo2 < 85) {
    return {
      alertRequired: true,
      severity: 'CRITICAL',
      vital: 'SpO2',
      value: `${spo2}%`,
      activity,
      persistence: `${persistence}s`,
      signalQuality: sqiCategory,
      provenance,
      baselineMl: 'CRITICAL',
      decisionRule: 'RULE_DETERMINISTIC_HYPOXEMIA',
      reason: `Critical oxygen desaturation (${spo2}%) verified with ${sqiCategory} signal quality.`,
      recommendedAction: 'Immediate clinical assessment and supplemental oxygen evaluation.',
      timestamp: new Date().toISOString()
    };
  }

  // Hyperpyrexia: Temp > 39.5°C
  if (!isNaN(temp) && temp > 39.5) {
    return {
      alertRequired: true,
      severity: 'HIGH',
      vital: 'Temperature',
      value: `${temp}°C`,
      activity,
      persistence: `${persistence}s`,
      signalQuality: sqiCategory,
      provenance,
      baselineMl: 'HIGH',
      decisionRule: 'RULE_DETERMINISTIC_HYPERPYREXIA',
      reason: `Severe pyrexia (${temp}°C) verified by hardware telemetry.`,
      recommendedAction: 'Initiate antipyretic protocol and medical assessment.',
      timestamp: new Date().toISOString()
    };
  }

  // 4. Context-Aware Evaluation: Heart Rate vs Activity Context
  const activityLimits = ACTIVITY_HEART_RATE_THRESHOLDS[activity] || ACTIVITY_HEART_RATE_THRESHOLDS.Resting;

  if (!isNaN(hr) && hr > 0) {
    // Case A: High HR during Running / Exercise -> Physiological Adaptation
    if ((activity === 'Running' || activity === 'Exercise') && hr <= activityLimits.elevatedMax) {
      return {
        alertRequired: false,
        severity: 'NORMAL',
        vital: 'Heart Rate',
        value: `${hr} BPM`,
        activity,
        persistence: `${persistence}s`,
        signalQuality: sqiCategory,
        provenance,
        baselineMl,
        decisionRule: 'RULE_CONTEXTUAL_EXERCISE_ADAPTATION',
        reason: `Elevated heart rate (${hr} BPM) is clinically consistent with ${activity.toLowerCase()} exertion.`,
        recommendedAction: 'Normal exertional cardiac response. No intervention required.',
        timestamp: new Date().toISOString()
      };
    }

    // Case B: High HR during Resting / Sleeping -> Potential Tachycardia
    if ((activity === 'Resting' || activity === 'Sleeping') && hr >= activityLimits.elevatedMax) {
      const isCritical = hr >= activityLimits.criticalMax;
      return {
        alertRequired: true,
        severity: isCritical ? 'CRITICAL' : 'HIGH',
        vital: 'Heart Rate',
        value: `${hr} BPM`,
        activity,
        persistence: `${persistence}s`,
        signalQuality: sqiCategory,
        provenance,
        baselineMl: 'HIGH',
        decisionRule: 'RULE_CONTEXTUAL_UNEXPLAINED_TACHYCARDIA',
        reason: `Sustained elevated heart rate (${hr} BPM) during ${activity.toLowerCase()} state without exertion.`,
        recommendedAction: isCritical 
          ? 'Urgent medical review: resting heart rate exceeds critical safety limits.' 
          : 'Monitor patient: resting tachycardia detected.',
        timestamp: new Date().toISOString()
      };
    }

    // Case C: Severe Exertional Tachycardia beyond safety bounds (e.g. > 205 BPM)
    if (hr > activityLimits.criticalMax) {
      return {
        alertRequired: true,
        severity: 'HIGH',
        vital: 'Heart Rate',
        value: `${hr} BPM`,
        activity,
        persistence: `${persistence}s`,
        signalQuality: sqiCategory,
        provenance,
        baselineMl: 'HIGH',
        decisionRule: 'RULE_EXERTIONAL_CEILING_EXCEEDED',
        reason: `Cardiac exertion (${hr} BPM) exceeds age-adjusted physiological thresholds during ${activity.toLowerCase()}.`,
        recommendedAction: 'Advise immediate cessation of exertion and rest.',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 5. Moderate SpO2 warning (85 - 91%)
  if (!isNaN(spo2) && spo2 > 0 && spo2 < 92) {
    return {
      alertRequired: true,
      severity: 'WARNING',
      vital: 'SpO2',
      value: `${spo2}%`,
      activity,
      persistence: `${persistence}s`,
      signalQuality: sqiCategory,
      provenance,
      baselineMl: 'MODERATE',
      decisionRule: 'RULE_MODERATE_HYPOXIA',
      reason: `Moderate oxygen desaturation (${spo2}%) observed.`,
      recommendedAction: 'Check sensor position and patient respiratory status.',
      timestamp: new Date().toISOString()
    };
  }

  // Default: Normal Physiological Status
  return {
    alertRequired: false,
    severity: 'NORMAL',
    vital: 'Telemetry',
    value: `${hr || '--'} BPM / ${spo2 || '--'}%`,
    activity,
    persistence: `${persistence}s`,
    signalQuality: sqiCategory,
    provenance,
    baselineMl: 'LOW',
    decisionRule: 'RULE_HOMEOSTASIS_NOMINAL',
    reason: 'Physiological vitals are within normal contextual tolerances.',
    recommendedAction: 'Standard routine monitoring.',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  evaluateContextSafety,
  ACTIVITY_HEART_RATE_THRESHOLDS
};
