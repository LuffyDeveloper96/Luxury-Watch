import crypto from 'crypto';
import assert from 'assert';
import mongoose from 'mongoose';
import './index.js';
import { Product, Coupon, Order, Payment, Return, User } from './models/index.js';
import { env } from './config/env.js';

const BASE_URL = `http://127.0.0.1:${env.PORT || 5000}/api`;

async function testRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

function generateSignature(gatewayOrderId, paymentId, secret) {
  const payload = `${gatewayOrderId}|${paymentId}`;
  return crypto.createHmac('sha256', secret || env.RAZORPAY_KEY_SECRET || 'test_secret').update(payload).digest('hex');
}

import { connectMongoDB } from './config/db.js';

async function runRemediationSecurityTestSuite() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('🛡️ LUXURY WATCH — STEP 6 REMEDIATION & PRODUCTION SECURITY SUITE');
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

  try {
    const timestamp = Date.now();
    const testSecret = env.RAZORPAY_KEY_SECRET || 'fwY1luM7zPSjySlGLatA4tf8';

    // 1. Authenticate Master Admin
    const adminLoginRes = await testRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: env.ADMIN_EMAIL, password: 'LuxuryWatch2026!' })
    });
    assert.strictEqual(adminLoginRes.status, 200, 'Admin login failed');
    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. Register Owner Patron
    const ownerEmail = `remed.owner.${timestamp}@luxurywatch.com`;
    const signupInit = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ email: ownerEmail, password: 'OwnerPassword2026!', name: 'Lady Genevieve', phone: '+91 98765 43210' })
    });
    // In test environment, fetch otpSession from memory / DB
    const { getDevOtpSession } = await import('./services/otpService.js');
    const ownerOtpSession = getDevOtpSession(ownerEmail);
    const ownerVerify = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: ownerEmail, otp: ownerOtpSession?.rawOtp || '' })
    });
    const ownerToken = ownerVerify.data.token;
    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };

    // 3. Register Unrelated Attacker Patron
    const attackerEmail = `remed.attacker.${timestamp}@luxurywatch.com`;
    await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ email: attackerEmail, password: 'AttackerPassword2026!', name: 'Intruder', phone: '+91 98765 43211' })
    });
    const attackerOtpSession = getDevOtpSession(attackerEmail);
    const attackerVerify = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: attackerEmail, otp: attackerOtpSession?.rawOtp || '' })
    });
    const attackerToken = attackerVerify.data.token;
    const attackerHeaders = { Authorization: `Bearer ${attackerToken}` };

    // Seed test product
    const testProdId = `remed-prod-${timestamp}`;
    await Product.create({
      id: testProdId,
      name: 'Vacheron Constantin Overseas [Perpetual + Ultra Thin]*',
      brand: 'Vacheron Constantin',
      category: "Men's Luxury",
      sku: `SKU-VC-REMED-${timestamp}`,
      price: 500000,
      stock: 10,
      active: true
    });

    // =========================================================================
    // SECTION 1: CRITICAL DIRECT ORDER CREATION BYPASS (FIX 1)
    // =========================================================================
    console.log('--- 1. CRITICAL DIRECT ORDER CREATION SECURITY ---');

    await test('1. Unauthenticated POST /api/orders is strictly rejected (401 Unauthorized)', async () => {
      const res = await testRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          customer: { fullName: 'Hacker', email: 'hacker@dark.net' },
          paymentStatus: 'Paid'
        })
      });
      assert.strictEqual(res.status, 401, 'Unauthenticated POST /api/orders must return 401');
    });

    await test('2. Non-Admin Attacker token cannot create direct orders (403 Forbidden)', async () => {
      const res = await testRequest('/orders', {
        method: 'POST',
        headers: attackerHeaders,
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          customer: { fullName: 'Attacker', email: attackerEmail },
          paymentStatus: 'Paid'
        })
      });
      assert.strictEqual(res.status, 403, 'Customer token cannot bypass payment gateway');
    });

    await test('3. Authenticated Master Admin can perform offline/manual order entry', async () => {
      const prodBefore = await Product.findOne({ id: testProdId }).lean();
      const stockBefore = prodBefore.stock;

      const res = await testRequest('/orders', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          customer: {
            fullName: 'VIP Offline Client',
            email: 'vip.offline@luxurywatch.com',
            phone: '+91 98200 98200',
            address: 'The Capital, BKC',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400051'
          },
          paymentStatus: 'Paid',
          orderStatus: 'Confirmed'
        })
      });

      assert.strictEqual(res.status, 201);
      assert.ok(res.data.order?.id);

      const prodAfter = await Product.findOne({ id: testProdId }).lean();
      assert.strictEqual(prodAfter.stock, stockBefore - 1, 'Admin order decrements stock correctly');
    });

    // =========================================================================
    // SECTION 2: HIGH PII RETURN LOOKUP DATA LEAKAGE GUARDS (FIX 2)
    // =========================================================================
    console.log('\n--- 2. RETURN LOOKUP PII DATA PRIVACY CONTROLS ---');

    // Create a real Return document with private customer PII
    const testReturnId = `RET-PRIV-${timestamp}`;
    const testOrderRef = `ORD-PRIV-${timestamp}`;
    await Return.create({
      id: testReturnId,
      orderId: testOrderRef,
      customerName: 'Lady Genevieve Du Maurier',
      customerEmail: ownerEmail,
      customerPhone: '+91 98200 88776',
      pickupAddress: 'Penthouse 4B, Samudra Mahal, Worli Seaface, Mumbai 400018',
      returnReason: 'Case diameter exceeds wrist preference',
      notes: 'VIP Client gate passcode: #8899',
      status: 'Requested',
      waybillNumber: `LW-RET-${timestamp}`,
      items: [{ name: 'Vacheron Constantin Overseas', quantity: 1 }]
    });

    await test('5. Public/Unauthenticated Return Lookup masks all customer PII', async () => {
      const res = await testRequest(`/returns/lookup/${testOrderRef}`);
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.returns && res.data.returns.length > 0);
      const publicReturn = res.data.returns[0];

      // Verify PII is masked / omitted
      assert.strictEqual(publicReturn.customerEmail, undefined, 'Email must NOT be returned publicly');
      assert.strictEqual(publicReturn.pickupAddress, undefined, 'Residential address must NOT be returned publicly');
      assert.strictEqual(publicReturn.notes, undefined, 'Private customer notes must NOT be returned publicly');
      assert.strictEqual(publicReturn.customer?.maskedName, 'L***', 'Name must be masked');
      assert.strictEqual(publicReturn.customer?.maskedPhone, '******8776', 'Phone must be masked');
      assert.strictEqual(publicReturn.isSanitized, true, 'isSanitized flag must be true');
    });

    await test('6. Authenticated Owner receives full return details', async () => {
      const res = await testRequest(`/returns/lookup/${testOrderRef}`, {
        headers: ownerHeaders
      });
      assert.strictEqual(res.status, 200);
      const ownerReturn = res.data.returns[0];

      assert.strictEqual(ownerReturn.customerEmail, ownerEmail);
      assert.strictEqual(ownerReturn.customerPhone, '+91 98200 88776');
      assert.strictEqual(ownerReturn.customerName, 'Lady Genevieve Du Maurier');
      assert.ok(ownerReturn.pickupAddress.includes('Penthouse 4B'));
    });

    await test('7. Unrelated Patron receives only sanitized tracking info for another return', async () => {
      const res = await testRequest(`/returns/lookup/${testOrderRef}`, {
        headers: attackerHeaders
      });
      assert.strictEqual(res.status, 200);
      const sanitized = res.data.returns[0];

      assert.strictEqual(sanitized.customerEmail, undefined);
      assert.strictEqual(sanitized.pickupAddress, undefined);
      assert.strictEqual(sanitized.isSanitized, true);
    });

    await test('8. Master Administrator receives full authorized return details', async () => {
      const res = await testRequest(`/returns/lookup/${testOrderRef}`, {
        headers: adminHeaders
      });
      assert.strictEqual(res.status, 200);
      const adminReturn = res.data.returns[0];

      assert.strictEqual(adminReturn.customerEmail, ownerEmail);
      assert.strictEqual(adminReturn.customerPhone, '+91 98200 88776');
    });

    // =========================================================================
    // SECTION 3: REGEX & ReDoS HARDENING (FIX 3)
    // =========================================================================
    console.log('\n--- 3. REGEX & ReDoS SEARCH HARDENING ---');

    const maliciousPatterns = [
      '[',
      '*',
      '+',
      '?',
      '(a+)+',
      '.*',
      '^$',
      '\\',
      '{'
    ];

    for (const pattern of maliciousPatterns) {
      await test(`9-12. Search query "${pattern}" does not crash server (ReDoS Guard)`, async () => {
        const res = await testRequest(`/products?search=${encodeURIComponent(pattern)}`);
        assert.strictEqual(res.status, 200, `Pattern "${pattern}" must return 200 OK without 500 error`);
        assert.ok(Array.isArray(res.data.products), 'Must return valid products array');
      });
    }

    await test('12b. Search with literal bracket "[" finds timepiece with bracket in title', async () => {
      const res = await testRequest('/products?search=' + encodeURIComponent('[') + '&limit=100');
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.products.some(p => p.id === testProdId), 'Must find watch containing literal "["');
    });

    // =========================================================================
    // SECTION 4: ADMIN PAGINATION CONTROLS (FIX 4)
    // =========================================================================
    console.log('\n--- 4. HIGH-GROWTH ADMIN PAGINATION CONTROLS ---');

    await test('13. Orders endpoint is paginated with page, limit, and total count', async () => {
      const res = await testRequest('/orders?page=1&limit=5', { headers: adminHeaders });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.orders));
      assert.ok(res.data.pagination);
      assert.strictEqual(res.data.pagination.page, 1);
      assert.strictEqual(res.data.pagination.limit, 5);
      assert.ok(res.data.pagination.total >= 1);
    });

    await test('14. Customers directory is paginated', async () => {
      const res = await testRequest('/admin/customers?page=1&limit=5', { headers: adminHeaders });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.customers));
      assert.ok(res.data.pagination);
      assert.strictEqual(res.data.pagination.page, 1);
    });

    await test('15. Returns directory is paginated', async () => {
      const res = await testRequest('/returns?page=1&limit=5', { headers: adminHeaders });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.returns));
      assert.ok(res.data.pagination);
      assert.strictEqual(res.data.pagination.page, 1);
    });

    await test('16. Maximum page size limit is strictly capped at 100', async () => {
      const res = await testRequest('/orders?limit=99999', { headers: adminHeaders });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.pagination.limit <= 100, 'Page size must be capped at 100 maximum');
    });

    // =========================================================================
    // SECTION 5: PAYMENT SECURITY REGRESSION (FIX 6)
    // =========================================================================
    console.log('\n--- 5. PAYMENT FINALIZATION INTEGRITY REGRESSION ---');

    await test('17. Valid Razorpay checkout creates order via paymentFinalizationService', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_remed_ok_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });

      assert.strictEqual(verifyRes.status, 200);
      assert.strictEqual(verifyRes.data.order.paymentStatus, 'Paid');

      const dbOrder = await Order.findOne({ 'paymentDetails.paymentId': payId });
      assert.ok(dbOrder, 'Order exists in MongoDB');
    });

    await test('18. Invalid Razorpay HMAC signature is rejected (400 Bad Request)', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_remed_bad_${Date.now()}`;

      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: 'fraudulent_tampered_sig' })
      });

      assert.strictEqual(verifyRes.status, 400);
      const dbOrder = await Order.findOne({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(dbOrder, null, 'No order created for forged signature');
    });

    await test('19. Duplicate payment re-verification is idempotent', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_remed_dup_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      const v1 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });
      const v2 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });

      assert.strictEqual(v1.status, 200);
      assert.strictEqual(v2.status, 200);
      assert.strictEqual(v2.data.isDuplicate, true);
      assert.strictEqual(v1.data.order.id, v2.data.order.id);

      const count = await Order.countDocuments({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(count, 1, 'Exactly one order in MongoDB');
    });

  } catch (fatalErr) {
    console.error('Fatal Remediation Test Exception:', fatalErr);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`📊 REMEDIATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runRemediationSecurityTestSuite();
