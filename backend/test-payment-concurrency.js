import crypto from 'crypto';
import assert from 'assert';
import mongoose from 'mongoose';
import './index.js';
import { Product, Coupon, Order, Payment } from './models/index.js';
import { env } from './config/env.js';
import { paymentFinalizationService } from './services/paymentFinalizationService.js';
import { isValidOrderTransition } from './models/Order.js';
import { supportsTransactions, connectMongoDB } from './config/db.js';

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

function generateWebhookSignature(body, secret) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return crypto.createHmac('sha256', secret || env.RAZORPAY_WEBHOOK_SECRET || 'default_webhook_secret_dev').update(raw).digest('hex');
}

async function runPaymentConcurrencyTestSuite() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('⚡ LUXURY WATCH — STEP 5 PAYMENT CONCURRENCY & TRANSACTION SUITE');
  console.log('======================================================================\n');

  console.log(`[Database] Topology Mode: ${supportsTransactions() ? 'Distributed ReplicaSet (session.withTransaction)' : 'Standalone MongoDB (Atomic Conditional + Rollback)'}`);

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
    const testWebhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'default_webhook_secret_dev';

    // Seed test watches
    const p1Id = `conc-prod1-${timestamp}`;
    await Product.create({
      id: p1Id,
      name: 'Audemars Piguet Royal Oak Offshore Tourbillon',
      brand: 'Audemars Piguet',
      category: "Men's Luxury",
      sku: `SKU-AP-CONC-${timestamp}`,
      price: 350000,
      stock: 10,
      active: true
    });

    const rareWatchId = `conc-rare-${timestamp}`;
    await Product.create({
      id: rareWatchId,
      name: 'Richard Mille RM 011 Felipe Massa Edition',
      brand: 'Richard Mille',
      category: "Men's Luxury",
      sku: `SKU-RM-RARE-${timestamp}`,
      price: 1200000,
      stock: 1, // Single unit worldwide
      active: true
    });

    const multiP2Id = `conc-multi2-${timestamp}`;
    await Product.create({
      id: multiP2Id,
      name: 'Rolex Day-Date 40 Platinum',
      brand: 'Rolex',
      category: "Men's Luxury",
      sku: `SKU-ROL-DD-${timestamp}`,
      price: 450000,
      stock: 0, // Out of stock for multi-item rollback test
      active: true
    });

    // Seed limited coupon
    const limitedCoupon = `CONCLIMIT_${timestamp}`;
    await Coupon.create({
      code: limitedCoupon,
      discountPercent: 10,
      minSpend: 50000,
      maxDiscount: 25000,
      usageLimit: 1,
      timesUsed: 0,
      active: true
    });

    // =========================================================================
    // TEST 1: Concurrent verification requests for the same payment
    // =========================================================================
    await test('1. Concurrent Verification Requests for Same Payment (Race Condition)', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }] })
      });
      assert.strictEqual(initRes.status, 200);
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_race1_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      const prodBefore = await Product.findOne({ id: p1Id }).lean();
      const stockBefore = prodBefore.stock;

      // Fire two simultaneous verification requests
      const [resA, resB] = await Promise.all([
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
        }),
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
        })
      ]);

      assert.strictEqual(resA.status, 200);
      assert.strictEqual(resB.status, 200);
      assert.strictEqual(resA.data.order.id, resB.data.order.id, 'Both concurrent requests must return same order ID');

      // Verify DB State: exactly 1 order in DB
      const orderDocs = await Order.find({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(orderDocs.length, 1, 'Database must contain exactly ONE order');

      // Verify DB State: stock decremented exactly once
      const prodAfter = await Product.findOne({ id: p1Id }).lean();
      assert.strictEqual(prodAfter.stock, stockBefore - 1, 'Stock must decrement exactly once');
    });

    // =========================================================================
    // TEST 2: Concurrent webhook + verification arriving simultaneously
    // =========================================================================
    await test('2. Concurrent Webhook + Verification Arriving Simultaneously', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_race2_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: payId, order_id: gwOrder, amount: 35000000, currency: 'INR' }
          }
        }
      };
      const webSig = generateWebhookSignature(webhookPayload, testWebhookSecret);

      const prodBefore = await Product.findOne({ id: p1Id }).lean();
      const stockBefore = prodBefore.stock;

      // Simultaneous dispatch of client verification and server webhook
      const [verifyRes, webhookRes] = await Promise.all([
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
        }),
        testRequest('/payments/razorpay/webhook', {
          method: 'POST',
          headers: { 'X-Razorpay-Signature': webSig },
          body: JSON.stringify(webhookPayload)
        })
      ]);

      assert.strictEqual(verifyRes.status, 200);
      assert.strictEqual(webhookRes.status, 200);

      // Verify DB State: exactly 1 order in DB
      const orderDocs = await Order.find({ 'paymentDetails.paymentId': payId });
      assert.strictEqual(orderDocs.length, 1, 'Database must contain exactly 1 order despite webhook+verify race');

      const prodAfter = await Product.findOne({ id: p1Id }).lean();
      assert.strictEqual(prodAfter.stock, stockBefore - 1, 'Stock must decrement exactly once');
    });

    // =========================================================================
    // TEST 3 & 4: Duplicate paymentId and gatewayOrderId reuse
    // =========================================================================
    await test('3 & 4. Duplicate Payment ID & Gateway Order ID Reuse Blocked', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_reuse_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      const res1 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });
      assert.strictEqual(res1.status, 200);
      const originalOrderId = res1.data.order.id;

      // Attempt to use same paymentId with a second new order
      const initRes2 = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }] })
      });
      const gwOrder2 = initRes2.data.gatewayOrderId;
      const sig2 = generateSignature(gwOrder2, payId, testSecret);

      const res2 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder2, paymentId: payId, signature: sig2 })
      });

      assert.strictEqual(res2.status, 200);
      assert.strictEqual(res2.data.isDuplicate, true);
      assert.strictEqual(res2.data.order.id, originalOrderId, 'Must return original order, never create a second order');
    });

    // =========================================================================
    // TEST 5 & 13: Two customers buying the final unit simultaneously & No Negative Stock
    // =========================================================================
    await test('5 & 13. Two Customers Buying Final Unit (stock=1) -> 1 Success, 1 Fail, Zero/No Negative Stock', async () => {
      const orderA = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: rareWatchId, quantity: 1 }] })
      });
      const orderB = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: rareWatchId, quantity: 1 }] })
      });

      const payA = `pay_rareA_${Date.now()}`;
      const sigA = generateSignature(orderA.data.gatewayOrderId, payA, testSecret);

      const payB = `pay_rareB_${Date.now()}`;
      const sigB = generateSignature(orderB.data.gatewayOrderId, payB, testSecret);

      const [resA, resB] = await Promise.all([
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: orderA.data.gatewayOrderId, paymentId: payA, signature: sigA })
        }),
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: orderB.data.gatewayOrderId, paymentId: payB, signature: sigB })
        })
      ]);

      const successCount = (resA.ok ? 1 : 0) + (resB.ok ? 1 : 0);
      const failCount = (!resA.ok ? 1 : 0) + (!resB.ok ? 1 : 0);

      assert.strictEqual(successCount, 1, 'Exactly one concurrent buyer must succeed');
      assert.strictEqual(failCount, 1, 'The second buyer must receive insufficient stock error');

      const rareDoc = await Product.findOne({ id: rareWatchId }).lean();
      assert.strictEqual(rareDoc.stock, 0, 'Final stock must be exactly 0, never negative');
      assert.ok(rareDoc.stock >= 0, 'No negative stock guarantee confirmed');
    });

    // =========================================================================
    // TEST 6 & 11: Multi-Item Order where 1 product is unavailable -> Full Rollback
    // =========================================================================
    await test('6 & 11. Multi-Item Order with 1 Unavailable Product -> Complete Transaction/Compensating Rollback', async () => {
      const prod1Before = await Product.findOne({ id: p1Id }).lean();
      const stock1Before = prod1Before.stock;

      // Pending payment with p1Id (in stock) AND multiP2Id (out of stock)
      const multiGw = `order_multi_${Date.now()}`;
      await Payment.create({
        transactionId: `TXN-MULTI-${Date.now()}`,
        gatewayOrderId: multiGw,
        amount: 800000,
        currency: 'INR',
        status: 'created',
        subtotal: 800000,
        total: 800000,
        items: [
          { id: p1Id, name: 'AP Watch', price: 350000, quantity: 1 },
          { id: multiP2Id, name: 'Rolex Day-Date', price: 450000, quantity: 1 } // Out of stock (0)
        ],
        customer: { fullName: 'Multi Tester', email: 'multi@luxurywatch.com' }
      });

      const multiPayId = `pay_multi_${Date.now()}`;
      const multiSig = generateSignature(multiGw, multiPayId, testSecret);

      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: multiGw, paymentId: multiPayId, signature: multiSig })
      });

      assert.strictEqual(verifyRes.status, 400);
      assert.ok(verifyRes.data.message.includes('unavailable') || verifyRes.data.message.includes('stock'));

      // Verify DB State: prod1 stock was NOT decremented (or was rolled back completely)
      const prod1After = await Product.findOne({ id: p1Id }).lean();
      assert.strictEqual(prod1After.stock, stock1Before, 'Product 1 stock must remain untouched after failed multi-item transaction');

      // Verify DB State: No Order was created
      const orderCount = await Order.countDocuments({ 'paymentDetails.gatewayOrderId': multiGw });
      assert.strictEqual(orderCount, 0, 'No order must exist in DB for rolled-back transaction');
    });

    // =========================================================================
    // TEST 7 & 8: Concurrent Coupon Usage Race Condition (usageLimit = 1)
    // =========================================================================
    await test('7, 8 & 16. Concurrent Coupon Usage Race (usageLimit=1) -> Exactly 1 Increment & 1 Order', async () => {
      // Buyer A initializes
      const orderA = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }], couponCode: limitedCoupon })
      });
      // Buyer B initializes
      const orderB = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }], couponCode: limitedCoupon })
      });

      const payA = `pay_coupA_${Date.now()}`;
      const sigA = generateSignature(orderA.data.gatewayOrderId, payA, testSecret);

      const payB = `pay_coupB_${Date.now()}`;
      const sigB = generateSignature(orderB.data.gatewayOrderId, payB, testSecret);

      // Concurrent verification
      const [resA, resB] = await Promise.all([
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: orderA.data.gatewayOrderId, paymentId: payA, signature: sigA })
        }),
        testRequest('/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({ gatewayOrderId: orderB.data.gatewayOrderId, paymentId: payB, signature: sigB })
        })
      ]);

      const successCount = (resA.ok ? 1 : 0) + (resB.ok ? 1 : 0);
      const failCount = (!resA.ok ? 1 : 0) + (!resB.ok ? 1 : 0);

      assert.strictEqual(successCount, 1, 'Exactly one concurrent buyer may consume the limited coupon');
      assert.strictEqual(failCount, 1, 'The other concurrent buyer must fail due to coupon exhaustion');

      // Verify DB State: timesUsed is exactly 1
      const couponDoc = await Coupon.findOne({ code: limitedCoupon }).lean();
      assert.strictEqual(couponDoc.timesUsed, 1, 'timesUsed must be exactly 1, never 2');
    });

    // =========================================================================
    // TEST 9: Invalid Payment State Transitions
    // =========================================================================
    await test('9. Invalid Payment State Transitions (paid->failed, cancelled->paid, failed->paid) Rejected', async () => {
      // Create a paid payment
      const paidGw = `order_paid_trans_${Date.now()}`;
      await Payment.create({
        transactionId: `TXN-PAID-${Date.now()}`,
        gatewayOrderId: paidGw,
        amount: 10000,
        currency: 'INR',
        status: 'paid',
        items: [{ id: p1Id, name: 'AP Watch', price: 10000, quantity: 1 }],
        customer: { fullName: 'Paid Tester', email: 'paid@luxurywatch.com' }
      });

      // Attempt to finalize cancelled payment
      const cancelledGw = `order_canc_${Date.now()}`;
      await Payment.create({
        transactionId: `TXN-CANC-${Date.now()}`,
        gatewayOrderId: cancelledGw,
        amount: 10000,
        currency: 'INR',
        status: 'cancelled',
        items: [{ id: p1Id, name: 'AP Watch', price: 10000, quantity: 1 }],
        customer: { fullName: 'Cancelled Tester', email: 'canc@luxurywatch.com' }
      });

      const cancRes = await paymentFinalizationService.finalizePayment({
        gatewayOrderId: cancelledGw,
        paymentId: `pay_canc_${Date.now()}`
      });
      assert.strictEqual(cancRes.success, false);
      assert.ok(cancRes.message.includes('cancelled'));

      // Attempt to finalize failed payment
      const failedGw = `order_fail_${Date.now()}`;
      await Payment.create({
        transactionId: `TXN-FAIL-${Date.now()}`,
        gatewayOrderId: failedGw,
        amount: 10000,
        currency: 'INR',
        status: 'failed',
        items: [{ id: p1Id, name: 'AP Watch', price: 10000, quantity: 1 }],
        customer: { fullName: 'Failed Tester', email: 'fail@luxurywatch.com' }
      });

      const failRes = await paymentFinalizationService.finalizePayment({
        gatewayOrderId: failedGw,
        paymentId: `pay_fail_${Date.now()}`
      });
      assert.strictEqual(failRes.success, false);
      assert.ok(failRes.message.includes('failed'));
    });

    // =========================================================================
    // TEST 10: Invalid Order State Transitions
    // =========================================================================
    await test('10. Invalid Order State Transitions (Cancelled->Confirmed, Delivered->Confirmed) Rejected', async () => {
      assert.strictEqual(isValidOrderTransition('Cancelled', 'Confirmed'), false);
      assert.strictEqual(isValidOrderTransition('Cancelled', 'Paid'), false);
      assert.strictEqual(isValidOrderTransition('Delivered', 'Confirmed'), false);
      assert.strictEqual(isValidOrderTransition('Confirmed', 'Processing'), true);
      assert.strictEqual(isValidOrderTransition('Processing', 'Shipped'), true);
      assert.strictEqual(isValidOrderTransition('Confirmed', 'Cancelled'), true);
    });

    // =========================================================================
    // TEST 12: Transaction / Rollback on Coupon Limit Failure
    // =========================================================================
    await test('12. Transaction / Rollback Verification on Coupon Limit Exceeded', async () => {
      const exhaustedCoupon = `EXHAUST_${timestamp}`;
      await Coupon.create({
        code: exhaustedCoupon,
        discountPercent: 10,
        usageLimit: 1,
        timesUsed: 1, // Already exhausted
        active: true
      });

      const prodBefore = await Product.findOne({ id: p1Id }).lean();
      const stockBefore = prodBefore.stock;

      const coupGw = `order_coup_fail_${Date.now()}`;
      await Payment.create({
        transactionId: `TXN-COUP-FAIL-${Date.now()}`,
        gatewayOrderId: coupGw,
        amount: 350000,
        currency: 'INR',
        status: 'created',
        subtotal: 350000,
        total: 315000,
        appliedCoupon: { code: exhaustedCoupon, discountPercent: 10 },
        items: [{ id: p1Id, name: 'AP Watch', price: 350000, quantity: 1 }],
        customer: { fullName: 'Coupon Tester', email: 'coupon@luxurywatch.com' }
      });

      const res = await paymentFinalizationService.finalizePayment({
        gatewayOrderId: coupGw,
        paymentId: `pay_exh_${Date.now()}`
      });

      assert.strictEqual(res.success, false);
      assert.ok(res.message.includes('Coupon') || res.message.includes('coupon'));

      // Verify DB State: stock was NOT decremented
      const prodAfter = await Product.findOne({ id: p1Id }).lean();
      assert.strictEqual(prodAfter.stock, stockBefore, 'Stock must not decrement when coupon limit check fails');
    });

    // =========================================================================
    // TEST 14 & 15: Exactly One Order & Exactly One Payment Record
    // =========================================================================
    await test('14 & 15. Exactly One Order & Exactly One Payment Paid Record in Database', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: p1Id, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_exact_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      // Repeat verification 3 times sequentially
      await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });
      await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });
      await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });

      const orders = await Order.find({ 'paymentDetails.paymentId': payId });
      const payments = await Payment.find({ gatewayOrderId: gwOrder, status: 'paid' });

      assert.strictEqual(orders.length, 1, 'Exactly one order in MongoDB');
      assert.strictEqual(payments.length, 1, 'Exactly one paid payment record in MongoDB');
    });

    // =========================================================================
    // TEST 17: Duplicate Webhook Delivery Idempotency
    // =========================================================================
    await test('17. Duplicate Webhook Delivery Idempotency', async () => {
      const hookGw = `order_dup_hook_${Date.now()}`;
      const hookPay = `pay_dup_hook_${Date.now()}`;

      await Payment.create({
        transactionId: `TXN-DUP-HOOK-${Date.now()}`,
        gatewayOrderId: hookGw,
        amount: 350000,
        currency: 'INR',
        status: 'created',
        subtotal: 350000,
        total: 350000,
        items: [{ id: p1Id, name: 'AP Watch', price: 350000, quantity: 1 }],
        customer: { fullName: 'Hook Client', email: 'hook@luxurywatch.com' }
      });

      const payload = {
        event: 'payment.captured',
        payload: {
          payment: { entity: { id: hookPay, order_id: hookGw, amount: 35000000, currency: 'INR' } }
        }
      };
      const validSig = generateWebhookSignature(payload, testWebhookSecret);

      const prodBefore = await Product.findOne({ id: p1Id }).lean();
      const stockBefore = prodBefore.stock;

      // Send webhook 3 times
      const r1 = await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': validSig },
        body: JSON.stringify(payload)
      });
      const r2 = await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': validSig },
        body: JSON.stringify(payload)
      });
      const r3 = await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': validSig },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(r1.status, 200);
      assert.strictEqual(r2.status, 200);
      assert.strictEqual(r3.status, 200);

      const prodAfter = await Product.findOne({ id: p1Id }).lean();
      assert.strictEqual(prodAfter.stock, stockBefore - 1, 'Stock must only decrement once for repeated webhook deliveries');

      const orders = await Order.find({ 'paymentDetails.paymentId': hookPay });
      assert.strictEqual(orders.length, 1, 'Only one order created');
    });

    // =========================================================================
    // TEST 18: payment.failed after successful payment cannot mark order as unpaid
    // =========================================================================
    await test('18. payment.failed Webhook After Successful Payment Cannot Invalidate Paid Order', async () => {
      const safeGw = `order_safepaid_${Date.now()}`;
      const safePay = `pay_safepaid_${Date.now()}`;

      await Payment.create({
        transactionId: `TXN-SAFE-${Date.now()}`,
        gatewayOrderId: safeGw,
        gatewayPaymentId: safePay,
        amount: 350000,
        currency: 'INR',
        status: 'paid', // Already paid
        items: [{ id: p1Id, name: 'AP Watch', price: 350000, quantity: 1 }],
        customer: { fullName: 'Safe Patron', email: 'safe@luxurywatch.com' }
      });

      // Late-arriving payment.failed webhook
      const failedPayload = {
        event: 'payment.failed',
        payload: {
          payment: { entity: { id: safePay, order_id: safeGw, error_description: 'Late failure event' } }
        }
      };
      const sig = generateWebhookSignature(failedPayload, testWebhookSecret);

      await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': sig },
        body: JSON.stringify(failedPayload)
      });

      const paymentDoc = await Payment.findOne({ gatewayOrderId: safeGw }).lean();
      assert.strictEqual(paymentDoc.status, 'paid', 'Status must remain "paid", late failure cannot override');
    });

    // =========================================================================
    // TEST 19: Abandoned / Pending Payment Cleanup
    // =========================================================================
    await test('19. Abandoned / Stale Pending Payment Cleanup Mechanism', async () => {
      const oldCreatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
      const abanGw = `order_aban_${Date.now()}`;

      await Payment.create({
        transactionId: `TXN-ABAN-${Date.now()}`,
        gatewayOrderId: abanGw,
        amount: 20000,
        currency: 'INR',
        status: 'created',
        createdAt: oldCreatedAt,
        items: [{ id: p1Id, name: 'AP Watch', price: 20000, quantity: 1 }]
      });

      const cleanupRes = await paymentFinalizationService.cleanupAbandonedPayments({ maxAgeHours: 24 });
      assert.ok(cleanupRes.modifiedCount >= 1, 'At least 1 stale payment cleaned up');

      const abanDoc = await Payment.findOne({ gatewayOrderId: abanGw }).lean();
      assert.strictEqual(abanDoc.status, 'cancelled');
      assert.ok(abanDoc.failureReason.includes('abandoned'));
    });

    // =========================================================================
    // TEST 20: Stale Lease Lock Recovery (Process Crash Simulation)
    // =========================================================================
    await test('20. Stale Processing Lease Recovery (Process Crash Simulation)', async () => {
      const crashGw = `order_crash_${Date.now()}`;
      const crashPay = `pay_crash_${Date.now()}`;
      const staleProcessingTime = new Date(Date.now() - 120000); // 2 minutes ago (stale lease)

      await Payment.create({
        transactionId: `TXN-CRASH-${Date.now()}`,
        gatewayOrderId: crashGw,
        amount: 350000,
        currency: 'INR',
        status: 'processing', // Left in processing by simulated crash
        processingAt: staleProcessingTime,
        processingWorkerId: 'worker_crashed_pid_9999',
        subtotal: 350000,
        total: 350000,
        items: [{ id: p1Id, name: 'AP Watch', price: 350000, quantity: 1 }],
        customer: { fullName: 'Crash Patron', email: 'crash@luxurywatch.com' }
      });

      // Next request arrives and recovers the stale processing lease
      const recoveryResult = await paymentFinalizationService.finalizePayment({
        gatewayOrderId: crashGw,
        paymentId: crashPay,
        signature: 'recovered_sig'
      });

      assert.strictEqual(recoveryResult.success, true);
      assert.strictEqual(recoveryResult.order.paymentStatus, 'Paid');

      const recoveredPayment = await Payment.findOne({ gatewayOrderId: crashGw }).lean();
      assert.strictEqual(recoveredPayment.status, 'paid');
      assert.strictEqual(recoveredPayment.orderId, recoveryResult.order.id);
    });

  } catch (fatalErr) {
    console.error('Fatal Concurrency Test Exception:', fatalErr);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`📊 CONCURRENCY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runPaymentConcurrencyTestSuite();
