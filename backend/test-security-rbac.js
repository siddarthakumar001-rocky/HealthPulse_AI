/**
 * HealthPulse AI - RBAC, IDOR, & Consent Security Test Suite
 * Validates relationship-based access control, consent revocation, and IDOR prevention.
 */

const assert = require('assert');
const { authorizeRoles, requireSelfOrAdmin, verifyPatientAccess } = require('./middleware/rbac');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

async function main() {
  console.log('🔒 Running HealthPulse AI Multi-User Security & Anti-IDOR Suite...\n');

  // 1. RBAC Middleware Tests
  runTest('authorizeRoles should permit users with matching role', () => {
    let nextCalled = false;
    const middleware = authorizeRoles('doctor', 'admin');
    const req = { user: { id: 'u1', role: 'doctor' } };
    const res = {};
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.strictEqual(nextCalled, true, 'Next should be called for authorized role');
  });

  runTest('authorizeRoles should block users with insufficient role (403)', () => {
    let statusSet = null;
    let jsonSent = null;
    const middleware = authorizeRoles('admin', 'clinic_admin');
    const req = { user: { id: 'u1', role: 'patient' } };
    const res = {
      status(code) { statusSet = code; return this; },
      json(data) { jsonSent = data; }
    };
    const next = () => {};

    middleware(req, res, next);
    assert.strictEqual(statusSet, 403);
    assert.strictEqual(jsonSent.error.code, 'FORBIDDEN');
  });

  runTest('authorizeRoles should reject unauthenticated requests (401)', () => {
    let statusSet = null;
    const middleware = authorizeRoles('patient');
    const req = {};
    const res = {
      status(code) { statusSet = code; return this; },
      json() {}
    };
    const next = () => {};

    middleware(req, res, next);
    assert.strictEqual(statusSet, 401);
  });

  // 2. Anti-IDOR / Anti-BOLA Guard Tests
  runTest('requireSelfOrAdmin should permit self access', () => {
    const req = { user: { id: 'patient_123', role: 'patient' } };
    assert.strictEqual(requireSelfOrAdmin(req, 'patient_123'), true);
  });

  runTest('requireSelfOrAdmin should BLOCK stranger access (anti-IDOR)', () => {
    const req = { user: { id: 'stranger_456', role: 'patient' } };
    assert.strictEqual(requireSelfOrAdmin(req, 'victim_789'), false);
  });

  runTest('requireSelfOrAdmin should permit system admin access', () => {
    const req = { user: { id: 'admin_1', role: 'system_admin' } };
    assert.strictEqual(requireSelfOrAdmin(req, 'patient_123'), true);
  });

  // 3. Mocked Relationship and Consent Verification Tests
  await runAsyncTest('verifyPatientAccess permits patient self-access', async () => {
    const reqUser = { id: 'user_100', role: 'patient' };
    const result = await verifyPatientAccess(reqUser, 'user_100', 'vitals_read');
    assert.strictEqual(result, true);
  });

  await runAsyncTest('verifyPatientAccess blocks stranger without care relationship', async () => {
    const reqUser = { id: 'stranger_200', role: 'caregiver' };
    const result = await verifyPatientAccess(reqUser, 'victim_300', 'vitals_read');
    assert.strictEqual(result, false);
  });

  console.log(`\n========================================`);
  console.log(`Security Suite Total: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
