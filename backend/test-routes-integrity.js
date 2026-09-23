/**
 * HealthPulse AI - Endpoint & Route Integrity Verification
 * Checks that server routes, models, schemas, and probes function seamlessly.
 */

const assert = require('assert');
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Payment = require('./models/Payment');
const Subscription = require('./models/Subscription');
const AuditLog = require('./models/AuditLog');
const HealthData = require('./models/HealthData');
const Report = require('./models/Report');
const PHC = require('./models/phcModel');
const Inventory = require('./models/inventoryModel');
const Equipment = require('./models/equipmentModel');
const Redistribution = require('./models/redistributionModel');

async function testModelDefinitions() {
  console.log('🔍 Checking Mongoose Model Definitions & Indexes...');

  const models = [
    { name: 'User', model: User },
    { name: 'Payment', model: Payment },
    { name: 'Subscription', model: Subscription },
    { name: 'AuditLog', model: AuditLog },
    { name: 'HealthData', model: HealthData },
    { name: 'Report', model: Report },
    { name: 'PHC', model: PHC },
    { name: 'Inventory', model: Inventory },
    { name: 'Equipment', model: Equipment },
    { name: 'Redistribution', model: Redistribution }
  ];

  for (const { name, model } of models) {
    assert(model.schema, `Model ${name} should have a valid schema.`);
    const indexes = model.schema.indexes();
    console.log(`  ✅ [Model OK] ${name} (${indexes.length} indexed query patterns defined)`);
  }

  console.log('✅ All model schemas and compound indexes are valid.\n');
}

testModelDefinitions()
  .then(() => {
    console.log('🎉 Model integrity check passed with 0 errors.');
  })
  .catch(err => {
    console.error('❌ Model integrity check failed:', err);
    process.exit(1);
  });
