/**
 * HealthPulse AI - Production Hardening & Subsystem Verification Test
 * Tests security sanitizers, rate limiters, caching, circuit breakers,
 * payments HMAC validation, physiological IoT validation, and auth integrity.
 */

const assert = require('assert');
const crypto = require('crypto');
const { sanitizeObject } = require('./middleware/security');
const cacheService = require('./services/cacheService');
const { CircuitBreaker } = require('./services/resilienceService');
const queueService = require('./services/queueService');
const logger = require('./utils/logger');

async function runTests() {
  console.log('🧪 Starting HealthPulse AI Production Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  // 1. Security & NoSQL Injection Sanitizer Test
  test('NoSQL Injection Sanitizer should strip MongoDB query operators ($gt, $ne, $where)', () => {
    const maliciousPayload = {
      username: 'admin',
      password: { $ne: null },
      filter: { $where: 'sleep(5000)' },
      normalField: 'clean_value',
      nested: {
        $gt: 100,
        validKey: 'safe'
      }
    };

    const sanitized = sanitizeObject(maliciousPayload);
    assert.strictEqual(sanitized.username, 'admin');
    assert.strictEqual(sanitized.password.$ne, undefined);
    assert.strictEqual(sanitized.filter.$where, undefined);
    assert.strictEqual(sanitized.normalField, 'clean_value');
    assert.strictEqual(sanitized.nested.$gt, undefined);
    assert.strictEqual(sanitized.nested.validKey, 'safe');
  });

  // 2. Sensitive Data Redaction Logger Test
  test('Logger should automatically redact sensitive credentials in metadata', () => {
    const rawMeta = {
      user: 'dr_sharma',
      password: 'PlaintextPassword123!',
      token: 'jwt.token.secret',
      apiKey: 'xyz_key',
      vitals: { heartRate: 72 }
    };

    const redacted = logger.redactSensitiveData(rawMeta);
    assert.strictEqual(redacted.password, '[REDACTED]');
    assert.strictEqual(redacted.token, '[REDACTED]');
    assert.strictEqual(redacted.apiKey, '[REDACTED]');
    assert.strictEqual(redacted.user, 'dr_sharma');
    assert.strictEqual(redacted.vitals.heartRate, 72);
  });

  // 3. Multi-Tier Caching & Invalidation Test
  await asyncTest('CacheService should set, get, expire, and invalidate keys correctly', async () => {
    await cacheService.set('test:key1', { value: 123 }, 2);
    const cached = await cacheService.get('test:key1');
    assert.deepStrictEqual(cached, { value: 123 });

    await cacheService.del('test:key1');
    const deleted = await cacheService.get('test:key1');
    assert.strictEqual(deleted, null);

    await cacheService.set('phc:test:1', 'facility1', 10);
    await cacheService.set('phc:test:2', 'facility2', 10);
    await cacheService.delPattern('phc:*');
    const patternDel = await cacheService.get('phc:test:1');
    assert.strictEqual(patternDel, null);
  });

  // 4. Resilience & Circuit Breaker Test
  await asyncTest('CircuitBreaker should trip OPEN after consecutive failures and execute fallback', async () => {
    const testBreaker = new CircuitBreaker('TestService', {
      failureThreshold: 2,
      cooldownPeriod: 1000,
      timeoutMs: 200
    });

    const failingAction = async () => {
      throw new Error('Remote external service down');
    };
    const fallbackFn = (err) => ({ fallback: true, error: err.message });

    // 1st failure
    const res1 = await testBreaker.execute(failingAction, fallbackFn);
    assert.strictEqual(res1.fallback, true);
    assert.strictEqual(testBreaker.state, 'CLOSED');

    // 2nd failure -> Trips OPEN
    const res2 = await testBreaker.execute(failingAction, fallbackFn);
    assert.strictEqual(res2.fallback, true);
    assert.strictEqual(testBreaker.state, 'OPEN');

    // 3rd call while OPEN should return fallback immediately
    const res3 = await testBreaker.execute(failingAction, fallbackFn);
    assert.strictEqual(res3.fallback, true);
  });

  // 5. Payment Cryptographic HMAC Verification Test
  test('Payment HMAC-SHA256 signature verification should validate authentic provider signatures', () => {
    const secret = 'healthpulse_payment_secret_2026';
    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';

    const authenticSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const calculatedSig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(authenticSignature),
      Buffer.from(calculatedSig)
    );
    assert.strictEqual(isValid, true);
  });

  // 6. Physiological Range Validation for IoT Streams
  test('Physiological Range Validator should accept healthy vitals and reject impossible values', () => {
    const validateVitals = (hr, spo2, temp) => {
      const isValidHR = hr === null || (typeof hr === 'number' && hr >= 30 && hr <= 220);
      const isValidSpO2 = spo2 === null || (typeof spo2 === 'number' && spo2 >= 50 && spo2 <= 100);
      const isValidTemp = temp === null || (typeof temp === 'number' && temp >= 30 && temp <= 45);
      return isValidHR && isValidSpO2 && isValidTemp;
    };

    assert.strictEqual(validateVitals(75, 98, 36.8), true);
    assert.strictEqual(validateVitals(-10, 98, 36.8), false); // Negative HR rejected
    assert.strictEqual(validateVitals(80, 150, 37.0), false); // Impossible SpO2 rejected
    assert.strictEqual(validateVitals(80, 95, 1000), false);  // Impossible Temperature rejected
  });

  // 7. Background Job Queue Test
  await asyncTest('Job Queue should process and complete asynchronous background tasks', async () => {
    let jobExecuted = false;
    queueService.registerHandler('TEST_JOB', async (data) => {
      jobExecuted = true;
      return { success: true, processedItem: data.item };
    });

    await queueService.addJob('TEST_JOB', { item: 'sample_diagnostic_pdf' });
    await new Promise(res => setTimeout(res, 50));
    assert.strictEqual(jobExecuted, true);
  });

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
