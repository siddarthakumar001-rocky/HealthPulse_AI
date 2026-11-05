const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validator');
const authMiddleware = require('../config/authMiddleware');

router.post('/register', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/google', authController.googleAuth);
router.post('/emergency-contact', authMiddleware, authController.updateEmergencyContact);
router.get('/user', authMiddleware, authController.getUser);

module.exports = router;
