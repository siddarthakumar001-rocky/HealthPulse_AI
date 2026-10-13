/**
 * Backend Architecture Integrity & Route Verification Test
 * Tests Signal Quality Engine, Observation Masking, Provenance Gating, and Context Sentinel logic
 */
const { assessSignalQuality } = require('./services/signalQualityEngine');
const { generateObservationMask } = require('./services/observationMasker');
const { evaluateProvenanceGate, PROVENANCE_TYPES } = require('./services/provenanceEngine');
const { evaluateContextSafety } = require('./services/contextSentinel');

console.log("=== HealthPulse AI IEEE Paper Alignment Verification ===");

// TEST 1: Sensor Disconnected / Empty
console.log("\n[TEST 1] Sensor Disconnected:");
const sqiDisconnected = assessSignalQuality(null);
console.log("SQI Status:", sqiDisconnected.status);
console.log("SQI Message:", sqiDisconnected.message);
if (sqiDisconnected.status !== 'UNAVAILABLE') throw new Error("TEST 1 FAILED");

// TEST 2: Optical Sensor Detachment (MAX30102 PPG finger off)
console.log("\n[TEST 2] Optical Sensor Decoupling:");
const sqiDetached = assessSignalQuality({ heartRate: 0, spo2: 0, temperature: 36.6 });
console.log("SQI Category:", sqiDetached.category);
console.log("Optical Contact Factor:", sqiDetached.factors.opticalSensorContact);
console.log("Message:", sqiDetached.message);
if (sqiDetached.category !== 'POOR' || sqiDetached.factors.opticalSensorContact !== false) throw new Error("TEST 2 FAILED");

// TEST 3: Observation Masking (Stage 3)
console.log("\n[TEST 3] Observation Masking M_c in {0, 1}:");
const maskTest = generateObservationMask({ heartRate: 78, spo2: null, temperature: 36.8 }, sqiDisconnected);
console.log("Channel Mask:", maskTest.mask);
console.log("Missingness Ratio:", maskTest.missingnessRatio);
if (maskTest.mask.spo2 !== 0 || maskTest.mask.temperature !== 1) throw new Error("TEST 3 FAILED");

// TEST 4: Provenance Gate - FORECAST cannot trigger emergency sirens
console.log("\n[TEST 4] Fail-Safe Hierarchy: FORECAST Gating:");
const forecastGate = evaluateProvenanceGate({ provenance: PROVENANCE_TYPES.FORECAST, value: 160 });
console.log("Forecast Emergency Permitted:", forecastGate.isEmergencyPermitted);
console.log("Reason:", forecastGate.reason);
if (forecastGate.isEmergencyPermitted !== false) throw new Error("TEST 4 FAILED");

// TEST 5: Context-Aware Adaptation: High HR + Running suppresses false emergency
console.log("\n[TEST 5] Context Sentinel: High HR + Running (Exercise Adaptation):");
const exerciseResult = evaluateContextSafety({
  vitals: { heartRate: 145, spo2: 98, temperature: 36.7 },
  activity: 'Running',
  provenance: PROVENANCE_TYPES.SENSOR
});
console.log("Alert Required:", exerciseResult.alertRequired);
console.log("Decision Rule:", exerciseResult.decisionRule);
console.log("Reason:", exerciseResult.reason);
if (exerciseResult.alertRequired !== false || exerciseResult.decisionRule !== 'RULE_CONTEXTUAL_EXERCISE_ADAPTATION') {
  throw new Error("TEST 5 FAILED");
}

// TEST 6: Context-Aware Triage: High HR + Resting triggers tachycardia alert
console.log("\n[TEST 6] Context Sentinel: High HR + Resting (Unexplained Tachycardia):");
const restingTachyResult = evaluateContextSafety({
  vitals: { heartRate: 145, spo2: 98, temperature: 36.7 },
  activity: 'Resting',
  provenance: PROVENANCE_TYPES.SENSOR
});
console.log("Alert Required:", restingTachyResult.alertRequired);
console.log("Severity:", restingTachyResult.severity);
console.log("Decision Rule:", restingTachyResult.decisionRule);
if (restingTachyResult.alertRequired !== true || restingTachyResult.severity !== 'CRITICAL') {
  throw new Error("TEST 6 FAILED");
}

// TEST 7: Poor Signal Quality triggers Warning, not Medical Crisis
console.log("\n[TEST 7] Fail-Safe Hierarchy: Poor Signal Quality produces Warning:");
const poorSignalAlert = evaluateContextSafety({
  vitals: { heartRate: 0, spo2: 0, temperature: 36.6 },
  activity: 'Resting',
  provenance: PROVENANCE_TYPES.SENSOR
});
console.log("Severity:", poorSignalAlert.severity);
console.log("Decision Rule:", poorSignalAlert.decisionRule);
if (poorSignalAlert.severity !== 'WARNING' || poorSignalAlert.decisionRule !== 'RULE_SQI_SENSOR_WARNING') {
  throw new Error("TEST 7 FAILED");
}

console.log("\n>>> ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY! <<<\n");
