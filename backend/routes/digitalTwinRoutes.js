const express = require('express');
const router = express.Router();
const digitalTwinController = require('../controllers/digitalTwinController');
const authMiddleware = require('../config/authMiddleware');

// Get real-time personalized Human Digital Twin
router.get('/', authMiddleware, digitalTwinController.getDigitalTwin);

// Sync live telemetry & evaluate context-aware alerts
router.post('/sync', authMiddleware, digitalTwinController.syncDigitalTwinTelemetry);

// Run CSDI Diffusion Imputation on physiological windows
router.post('/impute', authMiddleware, digitalTwinController.runCSDIImputation);

module.exports = router;
