const express = require('express');
const router = express.Router();
const phcController = require('../controllers/phcController');

// 1. Network Overview & Summary
router.get('/network-overview', phcController.getNetworkOverview);
router.get('/overview', phcController.getNetworkOverview);

// 2. Facilities
router.get('/facilities', phcController.getFacilities);
router.get('/facilities/:phcId', phcController.getFacilityById);

// 3. Smart Inventory
router.get('/inventory', phcController.getInventory);
router.get('/inventory/:phcId', phcController.getInventory);
router.post('/inventory/iot-update', phcController.updateInventoryIoT);

// 4. Patient Footfall & Anomaly
router.get('/footfall', phcController.getFootfall);
router.get('/footfall/:phcId', phcController.getFootfall);
router.post('/footfall', phcController.recordFootfall);

// 5. Equipment Assets
router.get('/equipment', phcController.getEquipment);
router.get('/equipment/:phcId', phcController.getEquipment);

// 6. AI Predictions & Forecasts
router.get('/predictions/:phcId', phcController.getPredictions);

// 7. Outbreak & Network Alerts
router.get('/outbreak-alerts', phcController.getOutbreakAlerts);
router.get('/alerts', phcController.getAlerts);
router.patch('/alerts/:alertId/acknowledge', phcController.acknowledgeAlert);
router.patch('/alerts/:alertId/resolve', phcController.resolveAlert);

// 8. Resource Redistribution
router.get('/redistribution/recommendations', phcController.getRedistributionRecommendations);
router.post('/redistribution/transfer', phcController.createTransfer);
router.patch('/redistribution/:id/approve', phcController.approveTransfer);

// 9. Digital Twin
router.get('/digital-twin/:phcId', phcController.getDigitalTwin);

// 10. Emergency Simulation Engine
router.post('/simulate/:scenario', phcController.triggerSimulation);

// 11. Offline Sync
router.post('/sync-offline', phcController.syncOfflineQueue);

module.exports = router;
