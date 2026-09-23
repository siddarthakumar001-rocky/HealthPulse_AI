/**
 * HealthPulse AI - Decision Engine
 * Converts AI predictions, IoT anomalies, and footfall patterns into actionable early warnings,
 * procurement recommendations, buffer adjustments, and redistribution commands.
 */

const aiPredictionEngine = require('./aiPredictionEngine');

class DecisionEngine {
  /**
   * Evaluate facility status and generate proactive recommendations
   */
  evaluateFacility(facility, inventory = [], footfallHistory = [], equipment = []) {
    const decisions = [];
    const alerts = [];

    // 1. Evaluate Footfall & Surge Risk
    const footfallPrediction = aiPredictionEngine.predictPatientFootfall(footfallHistory);
    const recentFootfall = footfallHistory[footfallHistory.length - 1];
    
    if (footfallPrediction.risk === 'High' || footfallPrediction.expectedIncreasePercentage > 35) {
      alerts.push({
        type: 'CAPACITY_OVERLOAD',
        severity: 'High',
        title: `Patient Surge Warning: +${footfallPrediction.expectedIncreasePercentage}% Expected`,
        description: `Projected daily load reaching ${footfallPrediction.sevenDayForecastAvg} patients/day. Current bed occupancy: ${Math.round((facility.occupiedBeds / facility.bedCapacity) * 100)}%.`,
        recommendedAction: 'Reallocate 2 nursing staff from outpatient to triage and prepare 6 emergency reserve beds.'
      });
      decisions.push({
        category: 'Staff & Bed Allocation',
        action: 'Activate Surge Protocol Stage 1',
        priority: 'High',
        confidence: footfallPrediction.confidence
      });
    }

    // 2. Evaluate Outbreak Cluster Signals
    if (recentFootfall && recentFootfall.diseaseCategories) {
      const outbreakSignals = aiPredictionEngine.detectPotentialOutbreak(recentFootfall.diseaseCategories);
      for (const sig of outbreakSignals) {
        alerts.push({
          type: 'OUTBREAK_SURGE',
          severity: sig.severity,
          title: sig.signalName,
          description: `Current rate ${sig.currentRate}/week vs baseline average ${sig.baselineAverage}/week (+${sig.percentageDeviation}% spike). Z-score: ${sig.zScore}.`,
          recommendedAction: sig.recommendedAction,
          aiConfidence: sig.confidence
        });
        decisions.push({
          category: 'Epidemic Response',
          action: `Deploy Emergency Buffer for ${sig.relatedMedicines.join(', ')}`,
          priority: sig.severity === 'Critical' ? 'Critical' : 'High',
          confidence: sig.confidence
        });
      }
    }

    // 3. Evaluate Inventory & Cold Chain
    for (const item of inventory) {
      const demandForecast = aiPredictionEngine.predictMedicineDemand(
        item, 
        footfallPrediction.expectedIncreasePercentage > 20 ? 1.3 : 1.0
      );

      // Stockout Risk Rule
      if (demandForecast.stockoutRisk === 'Critical' || demandForecast.stockoutRisk === 'High') {
        alerts.push({
          type: 'STOCKOUT_RISK',
          severity: demandForecast.stockoutRisk === 'Critical' ? 'Critical' : 'High',
          title: `Stockout Warning: ${item.medicineName}`,
          description: `Current stock of ${item.quantity} ${item.unit} predicted to deplete by ${demandForecast.estimatedDepletionWindow}. Safe buffer is ${item.safeBufferThreshold} ${item.unit}.`,
          recommendedAction: `Initiate Inter-Facility Redistribution transfer for ${Math.max(100, item.safeBufferThreshold - item.quantity)} units or fast-track district warehouse dispatch.`,
          aiConfidence: demandForecast.confidence
        });
      }

      // Cold Chain Breach Rule
      if (item.coldChainRequired) {
        if (item.storageTemperature < item.minTemperature || item.storageTemperature > item.maxTemperature) {
          alerts.push({
            type: 'COLD_CHAIN_BREACH',
            severity: 'Critical',
            title: `Cold Chain Temperature Breach: ${item.medicineName}`,
            description: `Current temperature reading is ${item.storageTemperature}°C (Safe range: ${item.minTemperature}°C - ${item.maxTemperature}°C). Batch #${item.batchNumber} at risk of degradation.`,
            recommendedAction: 'Inspect vaccine refrigerator thermostat, transfer stock to backup active cool box immediately.',
            aiConfidence: 98
          });
        }
      }

      // Expiry Warning Rule
      if (item.expiryDate) {
        const daysToExpiry = (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysToExpiry <= 45 && daysToExpiry > 0 && item.quantity > item.dailyBurnRate * 15) {
          alerts.push({
            type: 'EXPIRY_WARNING',
            severity: 'Medium',
            title: `Near Expiry Stock Alert: ${item.medicineName}`,
            description: `Batch #${item.batchNumber} (${item.quantity} ${item.unit}) expires in ${Math.round(daysToExpiry)} days. Projected local consumption will only utilize ~${Math.round(daysToExpiry * item.dailyBurnRate)} units.`,
            recommendedAction: 'Redistribute surplus units to high-consumption District Hospital to prevent wastage.',
            aiConfidence: 92
          });
        }
      }
    }

    // 4. Evaluate Equipment Failure Risk
    for (const eq of equipment) {
      if (eq.status === 'Warning' || eq.failureRisk === 'High' || eq.failureRisk === 'Critical') {
        alerts.push({
          type: 'EQUIPMENT_FAILURE',
          severity: eq.failureRisk === 'Critical' ? 'Critical' : 'High',
          title: `Equipment Maintenance Alert: ${eq.equipmentName} (${eq.equipmentId})`,
          description: `Operating hours reached ${eq.usageHours}h. Telemetry shows abnormal load/temperature patterns. Status: ${eq.status}.`,
          recommendedAction: 'Dispatch biomedical maintenance technician and reroute severe respiratory cases if backup is unavailable.',
          aiConfidence: 89
        });
      }
    }

    return {
      alerts,
      decisions,
      evaluatedAt: new Date()
    };
  }
}

module.exports = new DecisionEngine();
