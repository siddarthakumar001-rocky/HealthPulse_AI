/**
 * HealthPulse AI - Centralized Error Handling Middleware
 * Captures all unhandled errors, logs structured diagnostics with trace IDs,
 * and returns safe, standardized JSON error responses to clients.
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const requestId = req.id || 'unknown';
  const statusCode = err.status || err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Structured internal error logging
  logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}: ${err.message}`, {
    requestId,
    statusCode,
    errorName: err.name,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  // Handle Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: err.message,
        requestId
      }
    });
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID_FORMAT',
        message: `Invalid format for field: ${err.path}`,
        requestId
      }
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: messages.join(', '),
        requestId
      }
    });
  }

  // Safe client response
  const isProduction = process.env.NODE_ENV === 'production';
  const message = statusCode === 500 && isProduction
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message,
      requestId
    }
  });
};

module.exports = errorHandler;
