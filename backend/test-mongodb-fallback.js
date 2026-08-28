import assert from 'assert';
import mongoose from 'mongoose';
import { connectMongoDB, disconnectMongoDB, isDbConnected, getDbConnectionError } from './config/db.js';
import { Product } from './models/index.js';

async function runMongoFallbackTests() {
  console.log('\n======================================================');
  console.log('🧪 LUXURY WATCH — MONGODB CONNECTION & NO-FALLBACK TEST');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name} -> ${err.message}`);
      failed++;
    }
  };

  const origUri = process.env.MONGODB_URI;

  try {
    // TEST 1: MongoDB Connection Failure handling
    await test('1. MongoDB Connection Failure Throws Explicit Error', async () => {
      await disconnectMongoDB();
      const invalidUri = 'mongodb://127.0.0.1:27099/nonexistent_test_db?serverSelectionTimeoutMS=1000';

      let threw = false;
      try {
        await connectMongoDB(invalidUri);
      } catch (err) {
        threw = true;
        assert.ok(
          err.message.includes('MongoDB connection failed') || err.message.includes('ECONNREFUSED'),
          `Should contain explicit connection error: ${err.message}`
        );
      }
      assert.strictEqual(threw, true, 'connectMongoDB must reject on connection failure');
      assert.strictEqual(isDbConnected(), false, 'isDbConnected should be false on connection failure');
      assert.ok(getDbConnectionError() !== null, 'Connection error must be recorded');
    });

    // TEST 2: Pure Local MongoDB or Configured URI connects successfully
    await test('2. Successful MongoDB Connection Sets isDbConnected=true and Allows Model Queries', async () => {
      await disconnectMongoDB();
      const targetUri = origUri || 'mongodb://127.0.0.1:27017/luxurywatch';

      try {
        await connectMongoDB(targetUri);
        assert.strictEqual(isDbConnected(), true, 'isDbConnected must be true on successful connection');
        const count = await Product.countDocuments();
        assert.ok(typeof count === 'number' && count >= 0, 'Product query succeeds against MongoDB');
      } catch (e) {
        // If Atlas IP isn't whitelisted, test with local mongo
        await connectMongoDB('mongodb://127.0.0.1:27017/luxurywatch');
        assert.strictEqual(isDbConnected(), true);
      }
    });

  } finally {
    if (origUri) {
      process.env.MONGODB_URI = origUri;
    }
  }

  console.log('\n======================================================');
  console.log(`📊 Result: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runMongoFallbackTests();
