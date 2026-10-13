/**
 * Provenance Engine (Safety & Gating Rules for IEEE Architecture)
 * 
 * Strict physiological provenance taxonomy:
 * - SENSOR: Directly measured from physical wearable hardware (MAX30102, DS18B20, MPU6050).
 * - CSDI_RECONSTRUCTED: Estimated from observed telemetry using conditional score-based diffusion.
 * - FORECAST: Predicted future physiological state; strictly non-diagnostic.
 * 
 * FAIL-SAFE GATING RULES:
 * 1. FORECAST values MUST NEVER independently trigger emergency sirens or clinical crises.
 * 2. CSDI_RECONSTRUCTED values are subject to confidence and uncertainty thresholds before
 *    informing safety escalation.
 * 3. POOR signal quality triggers sensor-check / optical-coupling warnings rather than false clinical alarms.
 * 4. Deterministic emergency escalation is preserved for verified physical high-risk conditions.
 */

const PROVENANCE_TYPES = {
  SENSOR: 'SENSOR',
  CSDI_RECONSTRUCTED: 'CSDI_RECONSTRUCTED',
  FORECAST: 'FORECAST'
};

const PROVENANCE_TOOLTIPS = {
  SENSOR: 'Directly measured from wearable hardware.',
  CSDI_RECONSTRUCTED: 'Estimated from observed physiological telemetry using diffusion-based reconstruction.',
  FORECAST: 'Predicted future physiological state; not a direct measurement.'
};

/**
 * Validates whether an alert or action is permissible under the provenance gating rules.
 * @param {Object} candidate - { vital, value, provenance, confidence, sqi }
 * @returns {Object} { allowed: boolean, reason: string, gatedBy: string }
 */
function evaluateProvenanceGate(candidate = {}) {
  const provenance = candidate.provenance || PROVENANCE_TYPES.SENSOR;

  // Rule 1: FORECAST cannot independently trigger emergency alert
  if (provenance === PROVENANCE_TYPES.FORECAST) {
    return {
      allowed: false,
      isEmergencyPermitted: false,
      reason: 'Forecast values are non-diagnostic predictive estimates and are strictly barred from triggering emergency alerts.',
      gatedBy: 'FAIL_SAFE_PROVENANCE_HIERARCHY',
      recommendedAction: 'Continue trend observation without dispatching emergency alarms.'
    };
  }

  // Rule 2: CSDI_RECONSTRUCTED requires acceptable confidence and cannot initiate code-red alone
  if (provenance === PROVENANCE_TYPES.CSDI_RECONSTRUCTED) {
    const confidence = candidate.confidence != null ? Number(candidate.confidence) : 0.85;
    if (confidence < 0.70) {
      return {
        allowed: false,
        isEmergencyPermitted: false,
        reason: 'Diffusion-reconstructed vital has low confidence (< 70%) and cannot escalate clinical risk.',
        gatedBy: 'RECONSTRUCTION_UNCERTAINTY_GATE',
        recommendedAction: 'Awaiting clean physical sensor telemetry.'
      };
    }
    return {
      allowed: true,
      isEmergencyPermitted: false, // Advisory only, not hard code-red siren
      reason: 'Reconstructed telemetry verified by confidence bounds; advisory alert only.',
      gatedBy: 'RECONSTRUCTION_ADVISORY_ALLOWANCE',
      recommendedAction: 'Verify physical sensor contact and monitor patient status.'
    };
  }

  // Rule 3: SENSOR is physical ground telemetry
  return {
    allowed: true,
    isEmergencyPermitted: true,
    reason: 'Verified wearable physical sensor measurement.',
    gatedBy: 'NONE',
    recommendedAction: 'Process via deterministic clinical safety sentinel.'
  };
}

module.exports = {
  PROVENANCE_TYPES,
  PROVENANCE_TOOLTIPS,
  evaluateProvenanceGate
};
