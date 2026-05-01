const HealthData = require('../models/HealthData');
const HealthAnalysis = require('../models/HealthAnalysis');
const OnboardingData = require('../models/OnboardingData');
const { checkCriticalConditions } = require('./ruleEngine');
const axios = require('axios');

/**
 * Perform intelligent health analysis based on sensor data and onboarding profile.
 * Runs asynchronously to avoid blocking the IoT data pipeline.
 */
const analyzeUserHealth = async (userId, sensorData, deviceId) => {
  try {
    console.log(`[HealthService] Starting async analysis for User: ${userId}`);

    // 1. Fetch Latest Onboarding Data
    const onboarding = await OnboardingData.findOne({ user_id: userId }).sort({ createdAt: -1 });
    
    // 2. Rule-Based Stress Analysis
    const hr = sensorData.heartRate || 0;
    const spo2 = sensorData.spo2 || 0;
    
    let stressLevel = 'LOW';
    if (hr > 100 || (onboarding?.chest_pressure)) {
      stressLevel = 'HIGH';
    } else if (hr > 85) {
      stressLevel = 'MODERATE';
    }

    // 3. Health Score Calculation (Weighted)
    let healthScore = 100;
    
    // Vital penalties
    if (hr > 100 || hr < 50) healthScore -= 15;
    if (spo2 < 95) healthScore -= 20;
    if (spo2 < 90) healthScore -= 20;
    
    // Symptom penalties
    const symptomCount = (onboarding?.common_symptoms?.length || 0);
    healthScore -= (symptomCount * 5);
    
    // Existing condition penalties
    if (onboarding?.bp_issues) healthScore -= 10;
    if (onboarding?.sugar_issues) healthScore -= 10;
    
    healthScore = Math.max(0, Math.min(100, healthScore));

    // 4. Trigger External AI Analysis (Optional/Async)
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    let aiResult = null;
    
    try {
      if (onboarding) {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
          symptoms: onboarding.common_symptoms || [],
          onboardingData: onboarding,
          vitals: sensorData,
          location: { lat: 12.9716, lng: 77.5946 } // Default or last known
        }, { timeout: 3000 });
        aiResult = aiResponse.data;
      }
    } catch (aiErr) {
      console.warn("[HealthService] External AI Service unreachable, using local fallback.");
    }

    // 5. Consolidate and Save Analysis
    const ruleResults = checkCriticalConditions(onboarding || {}, sensorData);
    
    const analysis = new HealthAnalysis({
      user_id: userId,
      type: (aiResult?.type === 'EMERGENCY' || ruleResults.riskLevel === 'high') ? 'EMERGENCY' : 'NORMAL',
      condition: aiResult?.predictedDisease || (ruleResults.riskLevel === 'high' ? "Follow-up Required" : "Stable"),
      healthScore: aiResult?.healthScore || healthScore,
      riskLevel: aiResult?.riskLevel || ruleResults.riskLevel,
      dominantDosha: aiResult?.dosha || "N/A",
      recommendations: aiResult?.recommendations || {
        medicines: [],
        lifestyle: ["Stay hydrated", "Monitor vitals regularly"],
        diet: ["Light, warm meals"],
        disclaimer: "Interim analysis. Consult a professional."
      },
      sensorData: sensorData,
      timestamp: new Date()
    });

    // Add stressLevel to specific field if we had one, otherwise add to critical flags or similar
    // For now, let's keep it in the log and condition
    console.log(`[HealthService] Analysis Complete. Score: ${healthScore}, Stress: ${stressLevel}`);
    
    await analysis.save();
    return analysis;

  } catch (err) {
    console.error(`[HealthService] Error during async analysis:`, err);
  }
};

module.exports = {
  analyzeUserHealth
};
