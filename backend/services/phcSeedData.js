/**
 * HealthPulse AI - Public Healthcare Network Seed Data
 * Generates realistic PHCs, CHCs, District Hospitals in Bengaluru Urban, Bengaluru Rural & Karnataka
 * with real GPS coordinates, Smart Inventory, Footfall, Equipment, and Alerts.
 */

const PHC = require('../models/phcModel');
const Inventory = require('../models/inventoryModel');
const PatientFootfall = require('../models/patientFootfallModel');
const Equipment = require('../models/equipmentModel');
const Redistribution = require('../models/redistributionModel');
const PHCAlert = require('../models/phcAlertModel');

const bangaloreFacilities = [
  {
    facilityCode: 'PHC-BLR-001',
    name: 'Indiranagar Urban Primary Health Centre (BBMP)',
    type: 'PHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9784,
    longitude: 77.6408,
    bedCapacity: 25,
    occupiedBeds: 16,
    availableBeds: 9,
    staffCount: 18,
    staffOnDuty: 13,
    status: 'Optimal',
    networkHealthScore: 92,
    subScores: { medicineAvailability: 94, patientCapacity: 88, equipmentAvailability: 95, staffAvailability: 90, coldChainStability: 98, outbreakRiskScore: 10 },
    chiefMedicalOfficer: 'Dr. Srinivas Rao',
    contactNumber: '+91 80 2528 1234'
  },
  {
    facilityCode: 'PHC-BLR-002',
    name: 'Jayanagar General Hospital & CHC',
    type: 'CHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9308,
    longitude: 77.5838,
    bedCapacity: 150,
    occupiedBeds: 118,
    availableBeds: 32,
    staffCount: 95,
    staffOnDuty: 72,
    status: 'Optimal',
    networkHealthScore: 90,
    subScores: { medicineAvailability: 92, patientCapacity: 86, equipmentAvailability: 93, staffAvailability: 88, coldChainStability: 96, outbreakRiskScore: 12 },
    chiefMedicalOfficer: 'Dr. Meenakshi Sundaram',
    contactNumber: '+91 80 2656 2345'
  },
  {
    facilityCode: 'PHC-BLR-003',
    name: 'Koramangala Primary Health Centre',
    type: 'PHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9352,
    longitude: 77.6245,
    bedCapacity: 20,
    occupiedBeds: 18,
    availableBeds: 2,
    staffCount: 15,
    staffOnDuty: 10,
    status: 'Warning',
    networkHealthScore: 72,
    subScores: { medicineAvailability: 65, patientCapacity: 68, equipmentAvailability: 80, staffAvailability: 75, coldChainStability: 90, outbreakRiskScore: 32 },
    chiefMedicalOfficer: 'Dr. Priya Hegde',
    contactNumber: '+91 80 2553 3456'
  },
  {
    facilityCode: 'PHC-BLR-004',
    name: 'K.C. General Hospital (District Hospital)',
    type: 'District Hospital',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9982,
    longitude: 77.5712,
    bedCapacity: 300,
    occupiedBeds: 245,
    availableBeds: 55,
    staffCount: 180,
    staffOnDuty: 135,
    status: 'Optimal',
    networkHealthScore: 94,
    subScores: { medicineAvailability: 96, patientCapacity: 90, equipmentAvailability: 95, staffAvailability: 92, coldChainStability: 99, outbreakRiskScore: 8 },
    chiefMedicalOfficer: 'Dr. B.R. Venkatesh',
    contactNumber: '+91 80 2334 4567'
  },
  {
    facilityCode: 'PHC-BLR-005',
    name: 'Whitefield Community Health Centre',
    type: 'CHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9698,
    longitude: 77.7499,
    bedCapacity: 60,
    occupiedBeds: 48,
    availableBeds: 12,
    staffCount: 42,
    staffOnDuty: 30,
    status: 'Optimal',
    networkHealthScore: 88,
    subScores: { medicineAvailability: 89, patientCapacity: 85, equipmentAvailability: 91, staffAvailability: 86, coldChainStability: 95, outbreakRiskScore: 14 },
    chiefMedicalOfficer: 'Dr. Naveen Kumar',
    contactNumber: '+91 80 2845 5678'
  },
  {
    facilityCode: 'PHC-BLR-006',
    name: 'Yelahanka General Hospital & CHC',
    type: 'CHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 13.1007,
    longitude: 77.5963,
    bedCapacity: 80,
    occupiedBeds: 62,
    availableBeds: 18,
    staffCount: 55,
    staffOnDuty: 40,
    status: 'Optimal',
    networkHealthScore: 89,
    subScores: { medicineAvailability: 90, patientCapacity: 87, equipmentAvailability: 92, staffAvailability: 88, coldChainStability: 96, outbreakRiskScore: 11 },
    chiefMedicalOfficer: 'Dr. Radhika Shetty',
    contactNumber: '+91 80 2856 6789'
  },
  {
    facilityCode: 'PHC-BLR-007',
    name: 'Electronic City Primary Health Centre',
    type: 'PHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.8399,
    longitude: 77.6770,
    bedCapacity: 18,
    occupiedBeds: 17,
    availableBeds: 1,
    staffCount: 14,
    staffOnDuty: 9,
    status: 'Warning',
    networkHealthScore: 68,
    subScores: { medicineAvailability: 60, patientCapacity: 62, equipmentAvailability: 78, staffAvailability: 70, coldChainStability: 86, outbreakRiskScore: 40 },
    chiefMedicalOfficer: 'Dr. Anand Gowda',
    contactNumber: '+91 80 2852 7890'
  },
  {
    facilityCode: 'PHC-BLR-008',
    name: 'Rajajinagar Urban Primary Health Centre',
    type: 'PHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9915,
    longitude: 77.5526,
    bedCapacity: 22,
    occupiedBeds: 15,
    availableBeds: 7,
    staffCount: 16,
    staffOnDuty: 12,
    status: 'Optimal',
    networkHealthScore: 91,
    subScores: { medicineAvailability: 93, patientCapacity: 89, equipmentAvailability: 94, staffAvailability: 89, coldChainStability: 97, outbreakRiskScore: 9 },
    chiefMedicalOfficer: 'Dr. Shweta Murthy',
    contactNumber: '+91 80 2315 8901'
  },
  {
    facilityCode: 'PHC-BLR-009',
    name: 'Bowring & Lady Curzon Hospital (District Hospital)',
    type: 'District Hospital',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 12.9830,
    longitude: 77.6033,
    bedCapacity: 450,
    occupiedBeds: 380,
    availableBeds: 70,
    staffCount: 260,
    staffOnDuty: 195,
    status: 'Optimal',
    networkHealthScore: 95,
    subScores: { medicineAvailability: 97, patientCapacity: 92, equipmentAvailability: 96, staffAvailability: 94, coldChainStability: 99, outbreakRiskScore: 7 },
    chiefMedicalOfficer: 'Dr. Chandrashekhar K.',
    contactNumber: '+91 80 2559 1122'
  },
  {
    facilityCode: 'PHC-BLR-010',
    name: 'Hebbal Primary Health Centre (BBMP)',
    type: 'PHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 13.0358,
    longitude: 77.5970,
    bedCapacity: 15,
    occupiedBeds: 14,
    availableBeds: 1,
    staffCount: 12,
    staffOnDuty: 8,
    status: 'Warning',
    networkHealthScore: 70,
    subScores: { medicineAvailability: 66, patientCapacity: 64, equipmentAvailability: 82, staffAvailability: 74, coldChainStability: 88, outbreakRiskScore: 35 },
    chiefMedicalOfficer: 'Dr. Rashmi Nayak',
    contactNumber: '+91 80 2363 2233'
  },
  {
    facilityCode: 'PHC-BLR-011',
    name: 'K.R. Puram General Hospital & CHC',
    type: 'CHC',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    latitude: 13.0075,
    longitude: 77.6959,
    bedCapacity: 100,
    occupiedBeds: 82,
    availableBeds: 18,
    staffCount: 68,
    staffOnDuty: 50,
    status: 'Optimal',
    networkHealthScore: 89,
    subScores: { medicineAvailability: 91, patientCapacity: 87, equipmentAvailability: 92, staffAvailability: 88, coldChainStability: 96, outbreakRiskScore: 12 },
    chiefMedicalOfficer: 'Dr. Suresh Babu',
    contactNumber: '+91 80 2561 3344'
  },
  {
    facilityCode: 'PHC-BLR-012',
    name: 'Nelamangala Taluk Hospital & CHC',
    type: 'CHC',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    latitude: 13.0970,
    longitude: 77.3910,
    bedCapacity: 80,
    occupiedBeds: 60,
    availableBeds: 20,
    staffCount: 52,
    staffOnDuty: 38,
    status: 'Optimal',
    networkHealthScore: 87,
    subScores: { medicineAvailability: 88, patientCapacity: 86, equipmentAvailability: 90, staffAvailability: 85, coldChainStability: 95, outbreakRiskScore: 15 },
    chiefMedicalOfficer: 'Dr. Manjunath Swamy',
    contactNumber: '+91 80 2772 4455'
  }
];

const medicineTemplates = [
  { name: 'Paracetamol 500mg Tablets', category: 'Analgesics', unit: 'strips', buffer: 300, burn: 45, cold: false, minT: 15, maxT: 30, temp: 24 },
  { name: 'Amoxicillin 500mg Capsules', category: 'Antibiotics', unit: 'strips', buffer: 250, burn: 30, cold: false, minT: 15, maxT: 28, temp: 23 },
  { name: 'Oral Rehydration Salts (ORS)', category: 'Emergency', unit: 'packets', buffer: 500, burn: 60, cold: false, minT: 15, maxT: 30, temp: 25 },
  { name: 'Azithromycin 500mg Tablets', category: 'Antibiotics', unit: 'strips', buffer: 200, burn: 25, cold: false, minT: 15, maxT: 28, temp: 22 },
  { name: 'Oxytocin 10 IU Injection', category: 'Maternal Health', unit: 'ampoules', buffer: 120, burn: 12, cold: true, minT: 2, maxT: 8, temp: 4.5 },
  { name: 'Hepatitis B Vaccine 1ml', category: 'Vaccines', unit: 'vials', buffer: 100, burn: 10, cold: true, minT: 2, maxT: 8, temp: 3.8 },
  { name: 'Rotavirus Vaccine Oral Drops', category: 'Vaccines', unit: 'vials', buffer: 110, burn: 11, cold: true, minT: 2, maxT: 8, temp: 4.1 },
  { name: 'Normal Saline 0.9% IV 500ml', category: 'IV Fluids', unit: 'bottles', buffer: 400, burn: 40, cold: false, minT: 15, maxT: 30, temp: 24 },
  { name: 'Ringer Lactate IV 500ml', category: 'IV Fluids', unit: 'bottles', buffer: 350, burn: 32, cold: false, minT: 15, maxT: 30, temp: 23 },
  { name: 'Metformin 500mg Tablets', category: 'Chronic Care', unit: 'strips', buffer: 450, burn: 55, cold: false, minT: 15, maxT: 30, temp: 24 },
  { name: 'Salbutamol Respiratory Inhaler', category: 'Emergency', unit: 'canisters', buffer: 80, burn: 8, cold: false, minT: 15, maxT: 28, temp: 22 },
  { name: 'Human Insulin Regular 100IU', category: 'Chronic Care', unit: 'vials', buffer: 90, burn: 14, cold: true, minT: 2, maxT: 8, temp: 4.0 }
];

async function seedPublicHealthData(forceReset = false) {
  try {
    const existingCount = await PHC.countDocuments();
    const hasBangalore = await PHC.findOne({ district: 'Bengaluru Urban' });

    if (existingCount > 0 && hasBangalore && !forceReset) {
      console.log(`[Seed] Database contains ${existingCount} facilities including Bengaluru Network.`);
      return;
    }

    console.log('[Seed] Seeding Bengaluru Urban & Karnataka Healthcare Facilities Network...');

    // Clean previous seed if upgrading
    await Promise.all([
      PHC.deleteMany({}),
      Inventory.deleteMany({}),
      PatientFootfall.deleteMany({}),
      Equipment.deleteMany({}),
      Redistribution.deleteMany({}),
      PHCAlert.deleteMany({})
    ]);

    // 1. Create Bangalore PHCs
    const createdPHCs = await PHC.insertMany(bangaloreFacilities);
    console.log(`[Seed] Created ${createdPHCs.length} healthcare facilities across Bengaluru.`);

    // 2. Populate Inventory for each facility
    const inventoryDocs = [];
    const footfallDocs = [];
    const equipmentDocs = [];

    const now = new Date();

    createdPHCs.forEach((facility, fIdx) => {
      // Inventory
      medicineTemplates.forEach((med, mIdx) => {
        let qty = Math.round(med.buffer * (1.1 + (fIdx % 3) * 0.4));
        let stockHealth = 'Normal';

        if ((fIdx === 2 || fIdx === 6 || fIdx === 9) && (mIdx === 0 || mIdx === 1 || mIdx === 4)) {
          // Low or Critical Stock scenario (Koramangala / Electronic City / Hebbal)
          qty = Math.round(med.buffer * 0.3);
          stockHealth = 'Low';
        } else if ((fIdx === 1 || fIdx === 3 || fIdx === 8) && (mIdx === 0 || mIdx === 1)) {
          // Surplus donor facility (Jayanagar, KC General, Bowring)
          qty = Math.round(med.buffer * 3.2);
          stockHealth = 'Excess';
        }

        const expiryMonthsAhead = 6 + ((fIdx + mIdx) % 18);
        const expiryDate = new Date(now.getFullYear(), now.getMonth() + expiryMonthsAhead, 15);

        const daysLeft = med.burn > 0 ? Math.round(qty / med.burn) : 90;
        const estDepDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        inventoryDocs.push({
          phcId: facility._id,
          medicineName: med.name,
          category: med.category,
          batchNumber: `BAT-${facility.facilityCode.replace('PHC-BLR-', 'BLR')}-${100 + mIdx}`,
          quantity: qty,
          unit: med.unit,
          safeBufferThreshold: med.buffer,
          dailyBurnRate: med.burn,
          expiryDate,
          coldChainRequired: med.cold,
          storageTemperature: med.temp,
          minTemperature: med.minT,
          maxTemperature: med.maxT,
          iotTagId: `RFID-${facility.facilityCode}-${100 + mIdx}`,
          stockHealth,
          estimatedDepletionDate: `${estDepDate.getDate()} ${monthNames[estDepDate.getMonth()]} ${estDepDate.getFullYear()} ± 2 days`,
          confidenceScore: 90 + (fIdx % 6)
        });
      });

      // Footfall History (Last 7 days)
      for (let day = 6; day >= 0; day--) {
        const histDate = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
        const baseP = facility.type === 'District Hospital' ? 650 : facility.type === 'CHC' ? 320 : 135;
        const variation = Math.round(baseP * (0.9 + Math.random() * 0.25));

        footfallDocs.push({
          phcId: facility._id,
          timestamp: histDate,
          totalPatients: variation,
          newPatients: Math.round(variation * 0.65),
          emergencyPatients: Math.round(variation * 0.14),
          outpatientPatients: Math.round(variation * 0.8),
          admissions: Math.round(variation * 0.08),
          referrals: Math.round(variation * 0.04),
          averageWaitingTime: 18 + Math.round(Math.random() * 15),
          diseaseCategories: {
            Respiratory: Math.round(variation * 0.28),
            VectorBorne: Math.round(variation * 0.12),
            Diarrheal: Math.round(variation * 0.14),
            Fever: Math.round(variation * 0.22),
            Maternal: Math.round(variation * 0.08),
            Chronic: Math.round(variation * 0.12),
            Injury: Math.round(variation * 0.04),
            Other: Math.round(variation * 0.10)
          }
        });
      }

      // Equipment
      const eqTypes = [
        { name: 'Oxygen Concentrator 10L High-Flow', type: 'Oxygen Concentrator', status: 'Operational', risk: 'Low' },
        { name: 'Digital 12-Lead ECG Analyzer', type: 'ECG Machine', status: 'Operational', risk: 'Low' },
        { name: 'Smart IoT Vaccine Cold-Box Refrigerator', type: 'Vaccine Refrigerator', status: 'Operational', risk: 'Low' },
        { name: 'Solar Hybrid Power Backup Inverter 10kVA', type: 'Solar Power Inverter', status: 'Operational', risk: 'Low' },
        { name: 'Advanced Emergency Life Support (ALS) Ambulance', type: 'Ambulance', status: 'Operational', risk: 'Low' }
      ];

      eqTypes.forEach((eq, eqIdx) => {
        equipmentDocs.push({
          phcId: facility._id,
          equipmentId: `EQ-${facility.facilityCode}-${eqIdx + 1}`,
          equipmentName: `${facility.name} - ${eq.name}`,
          equipmentType: eq.type,
          status: (fIdx === 2 && eqIdx === 1) ? 'Warning' : eq.status,
          usageHours: 1450 + eqIdx * 320,
          failureRisk: (fIdx === 2 && eqIdx === 1) ? 'High' : eq.risk,
          iotConnected: true,
          lastTelemetry: {
            batteryPercentage: 94,
            operatingTemp: 33,
            loadPercentage: 55,
            timestamp: new Date()
          }
        });
      });
    });

    await Inventory.insertMany(inventoryDocs);
    await PatientFootfall.insertMany(footfallDocs);
    await Equipment.insertMany(equipmentDocs);

    // 3. Alerts in Bengaluru
    const sampleAlerts = [
      {
        phcId: createdPHCs[2]._id, // Koramangala PHC
        alertType: 'STOCKOUT_RISK',
        severity: 'High',
        title: `Low Stock Warning: Amoxicillin 500mg at ${createdPHCs[2].name}`,
        description: 'Current stock has fallen below the 50% safe buffer threshold. Depletion window: 3 ± 1 days.',
        triggerSource: 'IoT Smart Weight Sensor',
        aiConfidence: 93,
        recommendedAction: `Initiate Inter-Facility stock transfer from Jayanagar General Hospital (Surplus: 820 units, Distance: 5.2 km).`,
        status: 'Detected'
      },
      {
        phcId: createdPHCs[6]._id, // Electronic City PHC
        alertType: 'OUTBREAK_SURGE',
        severity: 'Medium',
        title: `Potential Vector-Borne Surge Signal at ${createdPHCs[6].name}`,
        description: 'Dengue & Fever symptom cases increased by +48% compared to historical 3-week baseline.',
        triggerSource: 'AI Epidemiological Baseline Engine',
        aiConfidence: 89,
        recommendedAction: 'Deploy extra NS1 rapid diagnostic kits and alert BBMP vector-control team.',
        status: 'Detected'
      }
    ];

    await PHCAlert.insertMany(sampleAlerts);

    // 4. Sample Inter-facility transfer in Bengaluru
    await Redistribution.create({
      sourcePHC: createdPHCs[1]._id, // Jayanagar CHC
      targetPHC: createdPHCs[2]._id, // Koramangala PHC
      resourceName: 'Amoxicillin 500mg Capsules',
      quantity: 400,
      unit: 'strips',
      urgencyLevel: 'High',
      distanceKm: 5.2,
      surplusLevel: 820,
      demandLevel: 400,
      stockoutRisk: 'High',
      expiryRisk: 'None',
      transportAvailability: 'Immediate',
      aiRecommendationScore: 96,
      aiReasoning: 'Donor Jayanagar General Hospital has 820 surplus units. Located only 5.2 km away. AI Score: 96/100.',
      status: 'Recommended'
    });

    console.log('[Seed] Successfully seeded Bengaluru Healthcare Network & Real-Time Logistics.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed Bengaluru data:', error.message);
  }
}

module.exports = { seedPublicHealthData };
