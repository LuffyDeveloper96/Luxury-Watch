import assert from 'assert';
import './index.js';
import { User, ActivityLog, Product } from './models/index.js';
import { env } from './config/env.js';
import { connectMongoDB, isDbConnected } from './config/db.js';

const BASE_URL = `http://127.0.0.1:${env.PORT || 5000}/api`;

async function api(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runStep8AuthValidationTests() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('🛡️ LUXURY WATCH — STEP 8 FINAL AUTHENTICATION TYPE VALIDATION SUITE');
  console.log('======================================================================\n');

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

  const timestamp = Date.now();

  try {
    // -------------------------------------------------------------------------
    // A & B: Object payloads (NoSQL injection vectors)
    // -------------------------------------------------------------------------
    console.log('--- A & B: Object Payloads ({ "$gt": "" }) ---');
    await test('A. Admin login with object email/password returns 400 Bad Request (not 500)', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } })
      });
      assert.strictEqual(res.status, 400, 'Must return HTTP 400 Bad Request');
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(typeof res.data.token, 'undefined', 'No token issued');
      assert.ok(!JSON.stringify(res.data).includes('is not a function'), 'No TypeError leaked');
    });

    await test('B. User login init with object email/password returns 400 Bad Request (not 500)', async () => {
      const res = await api('/auth/user/login/init', {
        method: 'POST',
        body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } })
      });
      assert.strictEqual(res.status, 400, 'Must return HTTP 400 Bad Request');
      assert.strictEqual(res.data.success, false);
      assert.ok(!JSON.stringify(res.data).includes('is not a function'), 'No TypeError leaked');
    });

    await test('B2. User signup init with object email/password returns 400 Bad Request', async () => {
      const res = await api('/auth/user/signup/init', {
        method: 'POST',
        body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } })
      });
      assert.strictEqual(res.status, 400, 'Must return HTTP 400 Bad Request');
      assert.strictEqual(res.data.success, false);
      assert.ok(!JSON.stringify(res.data).includes('is not a function'), 'No TypeError leaked');
    });

    await test('B3. User forgot password with object email returns 400 Bad Request', async () => {
      const res = await api('/auth/user/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: { $gt: '' } })
      });
      assert.strictEqual(res.status, 400, 'Must return HTTP 400 Bad Request');
      assert.strictEqual(res.data.success, false);
      assert.ok(!JSON.stringify(res.data).includes('is not a function'), 'No TypeError leaked');
    });

    // -------------------------------------------------------------------------
    // C & D: Array payloads
    // -------------------------------------------------------------------------
    console.log('\n--- C & D: Array Payloads ---');
    await test('C. Admin login with array email/password returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: ['admin@example.com'], password: ['password'] })
      });
      assert.strictEqual(res.status, 400, 'Must return HTTP 400 Bad Request');
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(typeof res.data.token, 'undefined');
    });

    await test('D. User login init with array email/password returns 400 Bad Request', async () => {
      const res = await api('/auth/user/login/init', {
        method: 'POST',
        body: JSON.stringify({ email: ['user@example.com'], password: ['secret'] })
      });
      assert.strictEqual(res.status, 400, 'Must return HTTP 400 Bad Request');
      assert.strictEqual(res.data.success, false);
    });

    // -------------------------------------------------------------------------
    // E & F: Missing fields
    // -------------------------------------------------------------------------
    console.log('\n--- E & F: Missing fields ---');
    await test('E. Admin login with missing email returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'SomePassword' })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('F. Admin login with missing password returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@luxurywatch.com' })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    // -------------------------------------------------------------------------
    // G: null email/password
    // -------------------------------------------------------------------------
    console.log('\n--- G: null email / password ---');
    await test('G1. Admin login with null fields returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: null, password: null })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('G2. User login with null fields returns 400 Bad Request', async () => {
      const res = await api('/auth/user/login/init', {
        method: 'POST',
        body: JSON.stringify({ email: null, password: null })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    // -------------------------------------------------------------------------
    // H: numeric email/password
    // -------------------------------------------------------------------------
    console.log('\n--- H: numeric email / password ---');
    await test('H1. Admin login with numeric fields returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: 12345, password: 67890 })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('H2. User signup with numeric email/password returns 400 Bad Request', async () => {
      const res = await api('/auth/user/signup/init', {
        method: 'POST',
        body: JSON.stringify({ email: 12345, password: 67890 })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    // -------------------------------------------------------------------------
    // I: boolean email/password
    // -------------------------------------------------------------------------
    console.log('\n--- I: boolean email / password ---');
    await test('I1. Admin login with boolean fields returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: true, password: false })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('I2. User login with boolean fields returns 400 Bad Request', async () => {
      const res = await api('/auth/user/login/init', {
        method: 'POST',
        body: JSON.stringify({ email: true, password: true })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    // -------------------------------------------------------------------------
    // J & K: empty and whitespace-only strings
    // -------------------------------------------------------------------------
    console.log('\n--- J & K: empty & whitespace strings ---');
    await test('J. Admin login with empty strings returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: '', password: '' })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('K. Admin login with whitespace-only strings returns 400 Bad Request', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: '   ', password: '   ' })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('K2. User login with whitespace-only strings returns 400 Bad Request', async () => {
      const res = await api('/auth/user/login/init', {
        method: 'POST',
        body: JSON.stringify({ email: '   ', password: '   ' })
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    // -------------------------------------------------------------------------
    // L: Valid authentication still succeeds
    // -------------------------------------------------------------------------
    console.log('\n--- L: Valid Authentication ---');
    await test('L. Valid Master Admin authentication succeeds and issues JWT', async () => {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: env.ADMIN_EMAIL, password: 'LuxuryWatch2026!' })
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(typeof res.data.token === 'string', 'Valid token string returned');
    });

    // -------------------------------------------------------------------------
    // Q: Quantity Hardening Tests
    // -------------------------------------------------------------------------
    console.log('\n--- Q: Quantity Hardening Validation ---');
    const testProd = await Product.create({
      id: `prod-qty-h-${timestamp}`,
      name: 'Patek Philippe Nautilus Quantity Test',
      brand: 'Patek Philippe',
      category: 'Haute Horlogerie',
      sku: `SKU-PP-QTY-${timestamp}`,
      price: 5500000,
      stock: 20,
      active: true
    });

    await test('Q1. createRazorpayOrder rejects float quantity (1.5) with 400', async () => {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 1.5 }] })
      });
      assert.strictEqual(res.status, 400, 'Float quantity must be rejected with 400');
      assert.strictEqual(res.data.success, false);
    });

    await test('Q2. createRazorpayOrder rejects negative quantity (-5) with 400', async () => {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: -5 }] })
      });
      assert.strictEqual(res.status, 400, 'Negative quantity must be rejected with 400');
      assert.strictEqual(res.data.success, false);
    });

    await test('Q3. createRazorpayOrder rejects zero quantity (0) with 400', async () => {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 0 }] })
      });
      assert.strictEqual(res.status, 400, 'Zero quantity must be rejected with 400');
      assert.strictEqual(res.data.success, false);
    });

    await test('Q4. createRazorpayOrder rejects string non-numeric quantity ("abc") with 400', async () => {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 'abc' }] })
      });
      assert.strictEqual(res.status, 400, 'String quantity must be rejected with 400');
      assert.strictEqual(res.data.success, false);
    });

    await test('Q5. createRazorpayOrder accepts valid integer quantity (2) with 200', async () => {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 2 }] })
      });
      assert.strictEqual(res.status, 200, 'Valid integer quantity must be accepted');
      assert.strictEqual(res.data.success, true);
    });

  } catch (fatal) {
    console.error('Fatal Auth Validation Exception:', fatal);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`📊 AUTHENTICATION & QUANTITY VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runStep8AuthValidationTests();
