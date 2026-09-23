/**
 * HealthPulse AI - Resilience & Circuit Breaker Service
 * Prevents cascading service failures from external APIs (Groq, DeepSeek, Grok, OSM Overpass)
 * with timeouts, exponential backoff retries, and circuit breaker protection.
 */

const logger = require('../utils/logger');

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3; // Trip after 3 consecutive failures
    this.cooldownPeriod = options.cooldownPeriod || 30000;  // 30 seconds cooldown
    this.timeoutMs = options.timeoutMs || 8000;            // 8 seconds default timeout
    this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF-OPEN'
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }

  isOpen() {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF-OPEN';
        logger.info(`[Circuit Breaker: ${this.name}] Transitioned from OPEN to HALF-OPEN (testing service recovery)`);
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    if (this.state === 'HALF-OPEN' || this.failureCount > 0) {
      logger.info(`[Circuit Breaker: ${this.name}] Success recorded. Resetting circuit to CLOSED.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(error) {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    logger.warn(`[Circuit Breaker: ${this.name}] Failure ${this.failureCount}/${this.failureThreshold}: ${error.message}`);

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF-OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownPeriod;
      logger.error(`[Circuit Breaker: ${this.name}] TRIPPED OPEN. Backing off for ${this.cooldownPeriod / 1000}s.`);
    }
  }

  /**
   * Execute an async action protected by circuit breaker and timeout
   */
  async execute(action, fallback = null) {
    if (this.isOpen()) {
      logger.warn(`[Circuit Breaker: ${this.name}] Request blocked: Circuit is OPEN.`);
      if (typeof fallback === 'function') {
        return fallback(new Error(`Service ${this.name} temporarily unavailable (Circuit OPEN)`));
      }
      return fallback;
    }

    try {
      // Wrap with timeout promise
      const result = await Promise.race([
        action(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Operation timed out after ${this.timeoutMs}ms`)), this.timeoutMs)
        )
      ]);

      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure(err);
      if (typeof fallback === 'function') {
        return fallback(err);
      }
      if (fallback !== null) {
        return fallback;
      }
      throw err;
    }
  }
}

// Registry of circuit breakers for external systems
const breakers = {
  groq: new CircuitBreaker('Groq-AI', { failureThreshold: 3, cooldownPeriod: 25000, timeoutMs: 8000 }),
  deepseek: new CircuitBreaker('DeepSeek-AI', { failureThreshold: 3, cooldownPeriod: 25000, timeoutMs: 8000 }),
  grok: new CircuitBreaker('Grok-AI', { failureThreshold: 3, cooldownPeriod: 25000, timeoutMs: 8000 }),
  overpass: new CircuitBreaker('OSM-Overpass', { failureThreshold: 4, cooldownPeriod: 30000, timeoutMs: 10000 }),
  payment: new CircuitBreaker('Payment-Gateway', { failureThreshold: 3, cooldownPeriod: 20000, timeoutMs: 7000 })
};

/**
 * Retry helper with exponential backoff for idempotent / safe operations
 */
async function retryWithBackoff(fn, maxRetries = 2, initialDelayMs = 500) {
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      logger.warn(`[Retry] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

module.exports = {
  CircuitBreaker,
  breakers,
  retryWithBackoff
};
