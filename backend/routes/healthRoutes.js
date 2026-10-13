const express = require('express');
const router = express.Router();
const healthDataController = require('../controllers/healthDataController');
const authMiddleware = require('../config/authMiddleware');

router.get('/', authMiddleware, healthDataController.getHealthData);
router.get('/current', authMiddleware, healthDataController.getHealthCurrent);
router.get('/signal-quality', authMiddleware, healthDataController.getSignalQuality);
router.get('/activity', authMiddleware, healthDataController.getActivityContext);
router.get('/reconstruction', authMiddleware, healthDataController.getReconstructionState);

module.exports = router;

