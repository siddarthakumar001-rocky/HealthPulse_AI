/**
 * HealthPulse AI - Payment Routes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../config/authMiddleware');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Public plans
router.get('/plans', paymentController.getPlans);

// Webhook from provider (no user auth header, uses HMAC signature)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Protected user payment routes
router.use(authMiddleware);
router.post('/create-order', paymentLimiter, paymentController.createOrder);
router.post('/verify', paymentLimiter, paymentController.verifyPayment);
router.get('/history', paymentController.getHistory);

module.exports = router;
