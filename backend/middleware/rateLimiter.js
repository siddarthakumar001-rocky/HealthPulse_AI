/**
 * HealthPulse AI - Multi-Tier Rate Limiting Configuration
 * Provides tiered protection for Authentication, Reports, AI, IoT, and General endpoints.
 */

const rateLimit = require('express-rate-limit');

// 1. General API Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Auth & Brute-Force Limiter (Login, Register, Admin Login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 mins per IP
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. AI Inference Limiter
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached. Please wait a few moments before requesting further diagnostics.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Report Upload & OCR Processing Limiter
const reportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 150,
  message: {
    success: false,
    error: {
      code: 'REPORT_RATE_LIMIT_EXCEEDED',
      message: 'Report upload limit reached. Please wait a few minutes before processing more documents.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. IoT Sensor Telemetry Limiter (High throughput for real-time sensor streams)
const deviceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 600, // Up to 10 Hz continuous or multiple sensors
  message: {
    success: false,
    error: {
      code: 'IOT_RATE_LIMIT_EXCEEDED',
      message: 'IoT telemetry rate limit exceeded.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. Payment Endpoints Limiter
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  message: {
    success: false,
    error: {
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
      message: 'Payment request limit reached. Please wait before initiating another transaction.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter,
  reportLimiter,
  deviceLimiter,
  paymentLimiter
};
