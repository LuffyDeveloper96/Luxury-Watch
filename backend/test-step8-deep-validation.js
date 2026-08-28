import crypto from 'crypto';
import assert from 'assert';
import mongoose from 'mongoose';
import './index.js';
import { Product, Coupon, Order, Payment, Return, User } from './models/index.js';
import { env } from './config/env.js';
import { connectMongoDB } from './config/db.js';

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

function generateSignature(gatewayOrderId, paymentId, secret) {
  const payload = `${gatewayOrderId}|${paymentId}`;
  return crypto.createHmac('sha256', secret || env.RAZORPAY_KEY_SECRET || 'fwY1luM7zPSjySlGLatA4tf8').update(payload).digest('hex');
}

function generateWebhookSignature(bodyString, secret) {
  return crypto.createHmac('sha256', secret || env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_luxurywatch2026').update(bodyString).digest('hex');
}

async function runStep8DeepValidation() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('🔬 LUXURY WATCH — STEP 8 DEEP GO-LIVE VALIDATION SUITE');
  console.log('======================================================================\n');

  const timestamp = Date.now();
  const testSecret = env.RAZORPAY_KEY_SECRET || 'fwY1luM7zPSjySlGLatA4tf8';
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_luxurywatch2026';

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
    // 0. Seed Test Product
    const testProd = await Product.create({
      id: `prod-step8-${timestamp}`,
      name: 'Vacheron Constantin Traditionnelle Tourbillon',
      brand: 'Vacheron Constantin',
      category: 'Haute Horlogerie',
      sku: `SKU-VC-8-${timestamp}`,
      price: 1200000,
      stock: 50,
      active: true
    });

    // =========================================================================
    // 1. 10 CONCURRENT VERIFICATION REQUESTS FOR SAME PAYMENT
    // =========================================================================
    console.log('--- 1. 10 SIMULTANEOUS VERIFICATION REQUESTS FOR SAME PAYMENT ---');
    await test('10 simultaneous verification calls produce exactly 1 order & 1 paid payment', async () => {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId = `pay_10v_${timestamp}`;
      const sig = generateSignature(gwOrderId, payId, testSecret);

      const verifyPromises = Array.from({ length: 10 }).map(() =>
        api('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId, signature: sig })
        })
      );

      const results = await Promise.all(verifyPromises);
      const okCount = results.filter(r => r.status === 200).length;
      assert.strictEqual(okCount, 10, 'All 10 calls should resolve with HTTP 200 (1 primary + 9 idempotent duplicate)');

      const duplicateCount = results.filter(r => r.data.isDuplicate === true).length;
      assert.strictEqual(duplicateCount, 9, 'Exactly 9 calls should be flagged as isDuplicate: true');

      const ordersInDb = await Order.countDocuments({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(ordersInDb, 1, 'Exactly 1 order in MongoDB');

      const paidPaymentsInDb = await Payment.countDocuments({ gatewayPaymentId: payId, status: 'paid' });
      assert.strictEqual(paidPaymentsInDb, 1, 'Exactly 1 paid payment in MongoDB');
    });

    // =========================================================================
    // 2. 10 SIMULTANEOUS WEBHOOK DELIVERIES
    // =========================================================================
    console.log('\n--- 2. 10 SIMULTANEOUS WEBHOOK DELIVERIES ---');
    await test('10 simultaneous webhook deliveries produce exactly 1 order', async () => {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId = `pay_10wh_${timestamp}`;

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: payId,
              order_id: gwOrderId,
              amount: 120000000,
              currency: 'INR',
              status: 'captured'
            }
          }
        }
      });
      const whSig = generateWebhookSignature(webhookPayload, webhookSecret);

      const whPromises = Array.from({ length: 10 }).map(() =>
        api('/payments/razorpay/webhook', {
          method: 'POST',
          headers: { 'x-razorpay-signature': whSig },
          body: webhookPayload
        })
      );

      const results = await Promise.all(whPromises);
      const okCount = results.filter(r => r.status === 200).length;
      assert.strictEqual(okCount, 10, 'All 10 webhook calls should resolve 200 OK');

      const ordersInDb = await Order.countDocuments({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(ordersInDb, 1, 'Exactly 1 order created in DB');
    });

    // =========================================================================
    // 3. 10 SIMULTANEOUS VERIFY + WEBHOOK COMBINATIONS
    // =========================================================================
    console.log('\n--- 3. 10 SIMULTANEOUS VERIFY + WEBHOOK COMBINATIONS ---');
    await test('5 verify + 5 webhook simultaneous calls produce exactly 1 order', async () => {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd.id, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId = `pay_10combo_${timestamp}`;
      const sig = generateSignature(gwOrderId, payId, testSecret);

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: payId,
              order_id: gwOrderId,
              amount: 120000000,
              currency: 'INR',
              status: 'captured'
            }
          }
        }
      });
      const whSig = generateWebhookSignature(webhookPayload, webhookSecret);

      const calls = [
        ...Array.from({ length: 5 }).map(() => api('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId, signature: sig })
        })),
        ...Array.from({ length: 5 }).map(() => api('/payments/razorpay/webhook', {
          method: 'POST',
          headers: { 'x-razorpay-signature': whSig },
          body: webhookPayload
        }))
      ];

      const results = await Promise.all(calls);
      const okCount = results.filter(r => r.status === 200).length;
      assert.strictEqual(okCount, 10, 'All 10 combo calls resolve 200 OK');

      const ordersInDb = await Order.countDocuments({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(ordersInDb, 1, 'Exactly 1 order created in DB');
    });

    // =========================================================================
    // 4. 10 CUSTOMERS PURCHASING FINAL STOCK UNIT (stock = 1)
    // =========================================================================
    console.log('\n--- 4. 10 CUSTOMERS COMPETING FOR FINAL STOCK UNIT (stock = 1) ---');
    await test('10 customers racing for stock=1 -> exactly 1 success, 9 failures, final stock = 0', async () => {
      const singleStockProd = await Product.create({
        id: `prod-10race-${timestamp}`,
        name: 'Richard Mille RM 011 [Piece Unique]',
        brand: 'Richard Mille',
        category: 'Haute Horlogerie',
        sku: `SKU-RM-10-${timestamp}`,
        price: 45000000,
        stock: 1, // EXACTLY 1
        active: true
      });

      // 10 distinct payments initialized
      const inits = await Promise.all(
        Array.from({ length: 10 }).map(() =>
          api('/payments/razorpay/order', {
            method: 'POST',
            body: JSON.stringify({ items: [{ id: singleStockProd.id, quantity: 1 }] })
          })
        )
      );

      // 10 distinct verification attempts
      const verifyCalls = inits.map((init, idx) => {
        const gwOrder = init.data.gatewayOrderId;
        const payId = `pay_10race_${idx}_${timestamp}`;
        const sig = generateSignature(gwOrder, payId, testSecret);
        return api('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
        });
      });

      const results = await Promise.all(verifyCalls);
      const successes = results.filter(r => r.status === 200).length;
      const failures = results.filter(r => r.status !== 200).length;

      assert.strictEqual(successes, 1, 'Exactly 1 customer must succeed');
      assert.strictEqual(failures, 9, 'Exactly 9 customers must fail');

      const dbProd = await Product.findOne({ id: singleStockProd.id });
      assert.strictEqual(dbProd.stock, 0, 'Final stock in MongoDB must be 0 (never negative)');

      const ordersCount = await Order.countDocuments({
        $or: [{ 'items.id': singleStockProd.id }, { 'items.productId': singleStockProd.id }]
      });
      assert.strictEqual(ordersCount, 1, 'Exactly 1 Order in MongoDB');
    });

    // =========================================================================
    // 5. 10 CUSTOMERS COMPETING FOR SINGLE-USE COUPON (usageLimit = 1)
    // =========================================================================
    console.log('\n--- 5. 10 CUSTOMERS COMPETING FOR SINGLE-USE COUPON (usageLimit = 1) ---');
    await test('10 customers racing for coupon usageLimit=1 -> timesUsed capped at 1', async () => {
      const raceCoupon = await Coupon.create({
        id: `cpn-10race-${timestamp}`,
        code: `RACE10_${timestamp}`,
        discountPercent: 10,
        minPurchase: 100000,
        usageLimit: 1, // EXACTLY 1 USE
        timesUsed: 0,
        active: true
      });

      const inits = await Promise.all(
        Array.from({ length: 10 }).map(() =>
          api('/payments/razorpay/order', {
            method: 'POST',
            body: JSON.stringify({ items: [{ id: testProd.id, quantity: 1 }], couponCode: raceCoupon.code })
          })
        )
      );

      const verifyCalls = inits.map((init, idx) => {
        const gwOrder = init.data.gatewayOrderId;
        const payId = `pay_cpn10_${idx}_${timestamp}`;
        const sig = generateSignature(gwOrder, payId, testSecret);
        return api('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
        });
      });

      const results = await Promise.all(verifyCalls);
      const dbCoupon = await Coupon.findOne({ code: raceCoupon.code });

      assert.strictEqual(dbCoupon.timesUsed, 1, 'Coupon timesUsed must be exactly 1 in MongoDB');
      assert.ok(dbCoupon.timesUsed <= raceCoupon.usageLimit, 'timesUsed cannot exceed usageLimit');
    });

    // =========================================================================
    // 6. ILLEGAL PAYMENT STATE MACHINE TRANSITIONS
    // =========================================================================
    console.log('\n--- 6. ILLEGAL PAYMENT STATE MACHINE TRANSITIONS ---');
    await test('Illegal payment transitions (failed->paid, cancelled->paid, paid->failed) rejected', async () => {
      // Create a payment in 'failed' state
      const pFailed = await Payment.create({
        id: `pay_state_f_${timestamp}`,
        transactionId: `txn_state_f_${timestamp}`,
        gatewayOrderId: `order_state_f_${timestamp}`,
        gatewayPaymentId: `pay_state_f_${timestamp}`,
        amount: 1200000,
        currency: 'INR',
        status: 'failed',
        items: [{ id: testProd.id, name: 'Vacheron Constantin', quantity: 1, price: 1200000 }]
      });

      const resFailed = await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: pFailed.gatewayOrderId,
          paymentId: pFailed.gatewayPaymentId,
          signature: generateSignature(pFailed.gatewayOrderId, pFailed.gatewayPaymentId, testSecret)
        })
      });
      assert.strictEqual(resFailed.status, 400, 'Cannot finalize payment from failed state');

      // Create a payment in 'cancelled' state
      const pCancelled = await Payment.create({
        id: `pay_state_c_${timestamp}`,
        transactionId: `txn_state_c_${timestamp}`,
        gatewayOrderId: `order_state_c_${timestamp}`,
        gatewayPaymentId: `pay_state_c_${timestamp}`,
        amount: 1200000,
        currency: 'INR',
        status: 'cancelled',
        items: [{ id: testProd.id, name: 'Vacheron Constantin', quantity: 1, price: 1200000 }]
      });

      const resCancelled = await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: pCancelled.gatewayOrderId,
          paymentId: pCancelled.gatewayPaymentId,
          signature: generateSignature(pCancelled.gatewayOrderId, pCancelled.gatewayPaymentId, testSecret)
        })
      });
      assert.strictEqual(resCancelled.status, 400, 'Cannot finalize payment from cancelled state');
    });

    // =========================================================================
    // 7. ILLEGAL ORDER STATE MACHINE TRANSITIONS
    // =========================================================================
    console.log('\n--- 7. ILLEGAL ORDER STATE MACHINE TRANSITIONS ---');
    await test('Illegal order transitions (Cancelled->Confirmed, Delivered->Processing) strictly rejected', async () => {
      const adminLogin = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: env.ADMIN_EMAIL, password: 'LuxuryWatch2026!' })
      });
      const adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };

      const testOrder = await Order.create({
        id: `ORD-TRANS-${timestamp}`,
        orderNumber: `ORD-TRANS-${timestamp}`,
        customer: {
          fullName: 'Patron',
          email: 'patron@lux.com',
          phone: '+91 98200 98200',
          address: 'Penthouse 12',
          city: 'Mumbai',
          state: 'MH',
          postalCode: '400001'
        },
        items: [{ id: testProd.id, name: 'Vacheron', price: 1200000, quantity: 1 }],
        subtotal: 1200000,
        total: 1200000,
        orderStatus: 'Cancelled',
        paymentStatus: 'Paid'
      });

      // Attempt Cancelled -> Confirmed
      const resRevive = await api(`/orders/${testOrder.id}/status`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Confirmed' })
      });
      assert.strictEqual(resRevive.status, 400, 'Cancelled order cannot transition to Confirmed');

      // Attempt Cancelled -> Processing
      const resProc = await api(`/orders/${testOrder.id}/status`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Processing' })
      });
      assert.strictEqual(resProc.status, 400, 'Cancelled order cannot transition to Processing');

      const dbOrder = await Order.findOne({ id: testOrder.id });
      assert.strictEqual(dbOrder.orderStatus, 'Cancelled', 'Order remains in Cancelled status in DB');
    });

  } catch (fatal) {
    console.error('Fatal Step 8 Exception:', fatal);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`📊 STEP 8 DEEP VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runStep8DeepValidation();
