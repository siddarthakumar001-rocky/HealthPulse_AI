/**
 * HealthPulse AI - IoT & Telemetry Simulator
 * Ingests and simulates real-world IoT telemetry:
 * - Smart Medicine Weight Scales
 * - Cold-Chain Temperature Probes
 * - RFID Gate Inventory Scans
 * - Footfall Counters
 * - Equipment Telemetry
 */

const PHC = require('../models/phcModel');
const Inventory = require('../models/inventoryModel');
const PatientFootfall = require('../models/patientFootfallModel');
const Equipment = require('../models/equipmentModel');
const IoTTelemetry = require('../models/iotTelemetryModel');
const PHCAlert = require('../models/phcAlertModel');
const aiPredictionEngine = require('./aiPredictionEngine');
const decisionEngine = require('./decisionEngine');

class IoTSimulator {
  constructor() {
    this.simulationState = {
      mode: 'NORMAL',
      activeSurgePhcId: null,
      activeColdChainPhcId: null,
      activeStockoutPhcId: null,
      activeOfflinePhcId: null
    };
  }

  /**
   * Set Simulation Scenario
   */
  async triggerScenario(scenarioName, targetFacilityCode = null) {
    const facilities = await PHC.find();
    if (!facilities || facilities.length === 0) return { error: 'No facilities found in database' };

    const targetPHC = targetFacilityCode 
      ? (facilities.find(f => f.facilityCode === targetFacilityCode) || facilities[0])
      : facilities[0];

    const result = { scenario: scenarioName, targetFacility: targetPHC.name, changes: [] };

    switch (scenarioName.toUpperCase()) {
      case 'DENGUE_SURGE': {
        this.simulationState.mode = 'DENGUE_SURGE';
        this.simulationState.activeSurgePhcId = targetPHC._id;

        // 1. Spike VectorBorne and Fever footfall
        const footfall = await PatientFootfall.create({
          phcId: targetPHC._id,
          totalPatients: 215,
          newPatients: 140,
          emergencyPatients: 38,
          outpatientPatients: 165,
          admissions: 12,
          referrals: 6,
          averageWaitingTime: 45,
          symptomCategories: {
            fever: 85,
            joint_pain: 62,
            rash: 34,
            cough_cold: 18,
            diarrhea_vomiting: 12,
            breathing_difficulty: 4,
            trauma: 0,
            maternal_checkup: 0
          },
          diseaseCategories: {
            VectorBorne: 48, // Massive spike from baseline 12
            Fever: 55,
            Respiratory: 15,
            Diarrheal: 10,
            Maternal: 8,
            Chronic: 12,
            Injury: 3,
            Other: 14
          }
        });

        // 2. Deplete Paracetamol and ORS inventory
        await Inventory.updateMany(
          { phcId: targetPHC._id, medicineName: { $regex: /Paracetamol|ORS|Saline/i } },
          { $set: { quantity: 180, stockHealth: 'Critical', dailyBurnRate: 65 } }
        );

        // 3. Update PHC Status
        targetPHC.status = 'Outbreak';
        targetPHC.networkHealthScore = 48;
        targetPHC.subScores.outbreakRiskScore = 92;
        targetPHC.subScores.medicineAvailability = 42;
        targetPHC.occupiedBeds = Math.min(targetPHC.bedCapacity, targetPHC.bedCapacity - 1);
        await targetPHC.save();

        // 4. Create Alert
        await PHCAlert.create({
          phcId: targetPHC._id,
          alertType: 'OUTBREAK_SURGE',
          severity: 'Critical',
          title: `Potential Dengue Surge Detected at ${targetPHC.name}`,
          description: `Vector-Borne cases surged to 48/week (+300% over baseline). Paracetamol and IV fluids depleting rapidly. Expected stockout within 3 days.`,
          triggerSource: 'AI Epidemiological Anomaly Engine',
          aiConfidence: 94,
          recommendedAction: 'Dispatch 500 units of Paracetamol from nearest surplus facility (PHC-002) and alert district vector-control unit.'
        });

        result.changes.push('Injected 48 VectorBorne cases spike (Z-score: 3.4)');
        result.changes.push('Burn rate increased to 65 units/day on essential antipyretics');
        result.changes.push('PHC status shifted to OUTBREAK; Alert broadcasted');
        break;
      }

      case 'COLD_CHAIN_FAILURE': {
        this.simulationState.mode = 'COLD_CHAIN_FAILURE';
        this.simulationState.activeColdChainPhcId = targetPHC._id;

        // Spike vaccine temperature
        await Inventory.updateMany(
          { phcId: targetPHC._id, coldChainRequired: true },
          { $set: { storageTemperature: 14.8, stockHealth: 'Critical' } }
        );

        // Log IoT telemetry breach
        await IoTTelemetry.create({
          deviceId: `CC-FRIDGE-${targetPHC.facilityCode}`,
          phcId: targetPHC._id,
          deviceType: 'ColdChain_Fridge',
          sensorType: 'Temperature',
          value: 14.8,
          unit: '°C',
          status: 'Critical',
          batteryLevel: 82,
          signalStrength: 'Good'
        });

        targetPHC.subScores.coldChainStability = 25;
        targetPHC.status = 'Warning';
        targetPHC.networkHealthScore = Math.max(45, targetPHC.networkHealthScore - 20);
        await targetPHC.save();

        await PHCAlert.create({
          phcId: targetPHC._id,
          alertType: 'COLD_CHAIN_BREACH',
          severity: 'Critical',
          title: `Critical Cold Chain Breach: 14.8°C at ${targetPHC.name}`,
          description: `Vaccine refrigerator temperature reached 14.8°C (Safe limit: 2°C - 8°C). Rotavirus, Hepatitis B, and TT vaccine batches at risk.`,
          triggerSource: 'IoT Smart Fridge Probe',
          detectedValue: 14.8,
          threshold: '2°C - 8°C',
          aiConfidence: 99,
          recommendedAction: 'Move vaccine stocks to backup passive cold boxes with frozen ice packs immediately. Biomedical engineer notified.'
        });

        result.changes.push('Cold chain fridge temperature spiked to 14.8°C');
        result.changes.push('Critical Cold Chain alert created for vaccine batches');
        break;
      }

      case 'MEDICINE_STOCKOUT': {
        this.simulationState.mode = 'MEDICINE_STOCKOUT';
        this.simulationState.activeStockoutPhcId = targetPHC._id;

        // Drain stock on key antibiotics and maternal items
        await Inventory.updateMany(
          { phcId: targetPHC._id, medicineName: { $regex: /Amoxicillin|Oxytocin|Azithromycin/i } },
          { $set: { quantity: 15, stockHealth: 'Critical', estimatedDepletionDate: 'Immediate / Stockout today' } }
        );

        targetPHC.subScores.medicineAvailability = 35;
        targetPHC.status = 'Warning';
        await targetPHC.save();

        await PHCAlert.create({
          phcId: targetPHC._id,
          alertType: 'STOCKOUT_RISK',
          severity: 'Critical',
          title: `Critical Medicine Stockout: Amoxicillin & Oxytocin at ${targetPHC.name}`,
          description: `Amoxicillin 500mg down to 15 capsules (Daily demand: 25). Zero buffer safety remaining.`,
          triggerSource: 'IoT Smart Scale & Inventory Engine',
          aiConfidence: 96,
          recommendedAction: 'Execute AI Inter-Facility Redistribution: 350 units available at nearby CHC within 14 km.'
        });

        result.changes.push('Depleted Amoxicillin & Oxytocin to 15 units');
        result.changes.push('Triggered Redistribution Matchmaker Recommendation');
        break;
      }

      case 'PATIENT_SURGE': {
        this.simulationState.mode = 'PATIENT_SURGE';
        
        await PatientFootfall.create({
          phcId: targetPHC._id,
          totalPatients: 195,
          newPatients: 120,
          emergencyPatients: 30,
          outpatientPatients: 150,
          admissions: 15,
          referrals: 5,
          averageWaitingTime: 55,
          symptomCategories: {
            fever: 60,
            cough_cold: 55,
            breathing_difficulty: 25,
            diarrhea_vomiting: 20,
            joint_pain: 10,
            rash: 5,
            trauma: 8,
            maternal_checkup: 12
          },
          diseaseCategories: {
            Respiratory: 42,
            Fever: 40,
            VectorBorne: 15,
            Diarrheal: 18,
            Maternal: 12,
            Chronic: 15,
            Injury: 8,
            Other: 15
          }
        });

        targetPHC.occupiedBeds = targetPHC.bedCapacity;
        targetPHC.subScores.patientCapacity = 45;
        targetPHC.status = 'Warning';
        await targetPHC.save();

        await PHCAlert.create({
          phcId: targetPHC._id,
          alertType: 'CAPACITY_OVERLOAD',
          severity: 'High',
          title: `Bed Capacity Overload at ${targetPHC.name}`,
          description: `100% bed occupancy reached (20/20 beds). Outpatient waiting time escalated to 55 mins.`,
          triggerSource: 'Footfall & Bed Telemetry Sensor',
          aiConfidence: 91,
          recommendedAction: 'Activate inter-facility overflow routing to Sub-District Hospital.'
        });

        result.changes.push('Patient footfall increased by +62%');
        result.changes.push('Bed occupancy escalated to 100% capacity');
        break;
      }

      case 'OFFLINE_MODE': {
        this.simulationState.mode = 'OFFLINE_MODE';
        targetPHC.connectivity.isOnline = false;
        targetPHC.connectivity.pendingSyncRecords = 28;
        targetPHC.status = 'Offline';
        await targetPHC.save();

        result.changes.push(`PHC ${targetPHC.name} placed in OFFLINE mode with 28 pending local queue records.`);
        break;
      }

      case 'RESET_NORMAL':
      default: {
        this.simulationState.mode = 'NORMAL';
        // Reset inventory, temperature, status
        await PHC.updateMany({}, {
          $set: {
            status: 'Optimal',
            networkHealthScore: 88,
            'connectivity.isOnline': true,
            'connectivity.pendingSyncRecords': 0,
            'subScores.medicineAvailability': 88,
            'subScores.patientCapacity': 85,
            'subScores.equipmentAvailability': 92,
            'subScores.staffAvailability': 88,
            'subScores.coldChainStability': 96,
            'subScores.outbreakRiskScore': 15
          }
        });

        await Inventory.updateMany(
          { coldChainRequired: true },
          { $set: { storageTemperature: 4.2, stockHealth: 'Normal' } }
        );

        await Inventory.updateMany(
          { stockHealth: 'Critical' },
          { $set: { quantity: 650, stockHealth: 'Normal', dailyBurnRate: 18 } }
        );

        result.changes.push('All facilities, inventory levels, and cold-chains restored to optimal baseline parameters.');
        break;
      }
    }

    return result;
  }
}

module.exports = new IoTSimulator();
