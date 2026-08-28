import crypto from 'crypto';
import assert from 'assert';
import './index.js';
import { Product, Coupon, Order, Payment } from './models/index.js';
import { env } from './config/env.js';
import { generateToken } from './middleware/auth.js';
import { connectMongoDB } from './config/db.js';

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

async function runPaymentSecurityTestSuite() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('🔒 LUXURY WATCH — STEP 4 PAYMENT SECURITY & AUDIT VERIFICATION SUITE');
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
    const testWebhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'default_webhook_secret_dev';

    // Seed test products
    const testProdId = `prod-sec-${timestamp}`;
    const testProdPrice = 250000;
    await Product.create({
      id: testProdId,
      name: 'Patek Philippe Nautilus Security Edition',
      brand: 'Patek Philippe',
      category: "Men's Luxury",
      sku: `SKU-SEC-${timestamp}`,
      price: testProdPrice,
      comparePrice: 300000,
      stock: 1, // Only 1 in stock for race condition & negative stock tests
      active: true
    });

    // Seed limited-use coupon
    const testCouponCode = `SECLIMIT_${timestamp}`;
    await Coupon.create({
      code: testCouponCode,
      discountPercent: 10,
      minSpend: 50000,
      maxDiscount: 25000,
      usageLimit: 1,
      timesUsed: 0,
      active: true
    });

    // =========================================================================
    // TEST 1: Valid HMAC-SHA256 Signature Verification & Server Order Creation
    // =========================================================================
    let orderResult1;
    let paymentId1 = `pay_valid_${timestamp}`;
    let validSignature1;

    await test('1. Valid Signature Verification & Server-Calculated Order', async () => {
      // Step A: Init order
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          couponCode: testCouponCode,
          deliverySpeed: 'Securitas Armoured Express (Insured)',
          customer: {
            fullName: 'Lord Sterling',
            email: 'lord.sterling@luxurywatch.com',
            phone: '+91 98200 98200',
            address: 'The Capital, BKC',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400051'
          }
        })
      });

      assert.strictEqual(initRes.status, 200);
      assert.ok(initRes.data.gatewayOrderId);
      orderResult1 = initRes.data;

      // Verify server calculation: 250,000 - 25,000 (10% max 25k) + 499 (shipping) = 225,499
      const expectedTotal = testProdPrice - 25000 + 499;
      assert.strictEqual(orderResult1.calculatedSummary.total, expectedTotal);

      // Step B: Verify with genuine signature
      validSignature1 = generateSignature(orderResult1.gatewayOrderId, paymentId1, testSecret);
      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: orderResult1.gatewayOrderId,
          paymentId: paymentId1,
          signature: validSignature1
        })
      });

      assert.strictEqual(verifyRes.status, 200);
      assert.strictEqual(verifyRes.data.success, true);
      assert.strictEqual(verifyRes.data.order.total, expectedTotal);
      assert.strictEqual(verifyRes.data.order.orderStatus, 'Confirmed');
      assert.strictEqual(verifyRes.data.order.paymentStatus, 'Paid');
    });

    // Seed second test product with stock = 5
    const testProd2Id = `prod-sec2-${timestamp}`;
    await Product.create({
      id: testProd2Id,
      name: 'Audemars Piguet Royal Oak Double Balance',
      brand: 'Audemars Piguet',
      category: "Men's Luxury",
      sku: `SKU-AP-${timestamp}`,
      price: 180000,
      stock: 5,
      active: true
    });

    let orderResult2;
    await test('2. Invalid Signature Rejection Verified', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProd2Id, quantity: 1 }]
        })
      });
      assert.strictEqual(initRes.status, 200);
      orderResult2 = initRes.data;

      const fakeSignature = 'a'.repeat(64);
      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: orderResult2.gatewayOrderId,
          paymentId: `pay_fake_${timestamp}`,
          signature: fakeSignature
        })
      });

      assert.strictEqual(verifyRes.status, 400);
      assert.strictEqual(verifyRes.data.success, false);
    });

    // =========================================================================
    // TEST 3: Missing Signature Rejection
    // =========================================================================
    await test('3. Missing Signature Rejected (400 Bad Request)', async () => {
      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: orderResult2.gatewayOrderId,
          paymentId: `pay_fake_${timestamp}`
        })
      });
      assert.strictEqual(verifyRes.status, 400);
      assert.strictEqual(verifyRes.data.success, false);
    });

    // =========================================================================
    // TEST 4: Forged orderData Rejection & Server Calculation Enforcement
    // =========================================================================
    await test('4. Forged orderData in Request Body Ignored (Server Uses DB Totals)', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProd2Id, quantity: 1 }]
        })
      });
      assert.strictEqual(initRes.status, 200);
      const gwOrder = initRes.data.gatewayOrderId;

      const payId = `pay_forge_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      // Malicious payload attempting to set total to 1 INR and items to cheap price
      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: gwOrder,
          paymentId: payId,
          signature: sig,
          orderData: {
            total: 1,
            subtotal: 1,
            discountAmount: 179999,
            items: [{ id: testProd2Id, price: 1, quantity: 1 }]
          }
        })
      });

      assert.strictEqual(verifyRes.status, 200);
      // Server must have enforced genuine DB price 180,000, NOT 1
      assert.strictEqual(verifyRes.data.order.total, 180000);
      assert.strictEqual(verifyRes.data.order.subtotal, 180000);
    });

    // =========================================================================
    // TEST 5: Frontend Price Manipulation in Order Init
    // =========================================================================
    await test('5. Frontend Price Manipulation Overridden by MongoDB Product Price', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProd2Id, price: 10, quantity: 1 }] // Attempted price manipulation
        })
      });
      assert.strictEqual(initRes.status, 200);
      assert.strictEqual(initRes.data.calculatedSummary.subtotal, 180000);
      assert.strictEqual(initRes.data.calculatedSummary.total, 180000);
    });

    // =========================================================================
    // TEST 6: Frontend Total Manipulation in Order Init
    // =========================================================================
    await test('6. Frontend Total Manipulation Overridden by Server Calculation', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProd2Id, quantity: 1 }],
          total: 50, // Attempted total manipulation
          subtotal: 50
        })
      });
      assert.strictEqual(initRes.status, 200);
      assert.strictEqual(initRes.data.calculatedSummary.total, 180000);
    });

    // =========================================================================
    // TEST 7: Frontend Shipping Fee Manipulation
    // =========================================================================
    await test('7. Frontend Shipping Fee Manipulation Replaced by Server Policy', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProd2Id, quantity: 1 }],
          shippingFee: -500, // Negative shipping attempt
          deliverySpeed: 'Securitas Armoured Express (Insured)'
        })
      });
      assert.strictEqual(initRes.status, 200);
      assert.strictEqual(initRes.data.calculatedSummary.shippingFee, 499);
      assert.strictEqual(initRes.data.calculatedSummary.total, 180499);
    });

    // =========================================================================
    // TEST 8: Invalid / Unknown gatewayOrderId
    // =========================================================================
    await test('8. Invalid gatewayOrderId Rejected (400 Bad Request)', async () => {
      const fakeGw = `order_UNKNOWN_${Date.now()}`;
      const fakePay = `pay_${Date.now()}`;
      const sig = generateSignature(fakeGw, fakePay, testSecret);

      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: fakeGw,
          paymentId: fakePay,
          signature: sig
        })
      });

      assert.strictEqual(verifyRes.status, 400);
      assert.strictEqual(verifyRes.data.success, false);
    });

    // =========================================================================
    // TEST 9: Payment / Order Mismatch
    // =========================================================================
    await test('9. Payment and Order ID Mismatch Rejected', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd2Id, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;

      // Signature calculated with wrong gatewayOrderId
      const mismatchedSig = generateSignature('order_OTHER_12345', 'pay_mismatch_1', testSecret);

      const verifyRes = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          gatewayOrderId: gwOrder,
          paymentId: 'pay_mismatch_1',
          signature: mismatchedSig
        })
      });

      assert.strictEqual(verifyRes.status, 400);
      assert.strictEqual(verifyRes.data.success, false);
    });

    // =========================================================================
    // TEST 10: Duplicate Payment Protection (Same Payment ID Cannot Create Two Orders)
    // =========================================================================
    await test('10. Duplicate Payment Protection (Single Order per Payment ID)', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd2Id, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const dupPayId = `pay_dup_${Date.now()}`;
      const sig = generateSignature(gwOrder, dupPayId, testSecret);

      // First verification creates order
      const res1 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: dupPayId, signature: sig })
      });
      assert.strictEqual(res1.status, 200);
      const originalOrderId = res1.data.order.id;

      // Attempt to reuse same paymentId with a second new order
      const initRes2 = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd2Id, quantity: 1 }] })
      });
      const gwOrder2 = initRes2.data.gatewayOrderId;
      const sig2 = generateSignature(gwOrder2, dupPayId, testSecret);

      const res2 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder2, paymentId: dupPayId, signature: sig2 })
      });

      assert.strictEqual(res2.status, 200);
      assert.strictEqual(res2.data.isDuplicate, true);
      assert.strictEqual(res2.data.order.id, originalOrderId, 'Must return original order, not create duplicate');
    });

    // =========================================================================
    // TEST 11: Duplicate Verification Request Idempotency
    // =========================================================================
    await test('11. Duplicate Verification Idempotency (Safe Re-verification)', async () => {
      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProd2Id, quantity: 1 }] })
      });
      const gwOrder = initRes.data.gatewayOrderId;
      const payId = `pay_idem_${Date.now()}`;
      const sig = generateSignature(gwOrder, payId, testSecret);

      const prodBefore = await Product.findOne({ id: testProd2Id }).lean();
      const stockBefore = prodBefore.stock;

      // First call
      const res1 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });
      assert.strictEqual(res1.status, 200);

      const prodAfterFirst = await Product.findOne({ id: testProd2Id }).lean();
      assert.strictEqual(prodAfterFirst.stock, stockBefore - 1);

      // Exact second call
      const res2 = await testRequest('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrder, paymentId: payId, signature: sig })
      });
      assert.strictEqual(res2.status, 200);
      assert.strictEqual(res2.data.isDuplicate, true);

      // Stock must NOT have decremented again!
      const prodAfterSecond = await Product.findOne({ id: testProd2Id }).lean();
      assert.strictEqual(prodAfterSecond.stock, stockBefore - 1, 'Stock must not decrement twice on idempotent retry');
    });

    // =========================================================================
    // TEST 12 & 13: Concurrent Stock Purchase & Zero/Negative Stock Protection
    // =========================================================================
    await test('12 & 13. Atomic Stock Reservation & Zero/Negative Stock Protection', async () => {
      const rareWatchId = `prod-rare-${timestamp}`;
      await Product.create({
        id: rareWatchId,
        name: 'Vacheron Constantin Les Cabinotiers 1/1 Edition',
        brand: 'Vacheron Constantin',
        category: "Men's Luxury",
        sku: `SKU-VC-${timestamp}`,
        price: 950000,
        stock: 1, // Only 1 piece worldwide
        active: true
      });

      // Buyer A initializes order
      const orderA = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: rareWatchId, quantity: 1 }] })
      });
      // Buyer B initializes order
      const orderB = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: rareWatchId, quantity: 1 }] })
      });

      assert.strictEqual(orderA.status, 200);
      assert.strictEqual(orderB.status, 200);

      const payA = `pay_A_${Date.now()}`;
      const sigA = generateSignature(orderA.data.gatewayOrderId, payA, testSecret);

      const payB = `pay_B_${Date.now()}`;
      const sigB = generateSignature(orderB.data.gatewayOrderId, payB, testSecret);

      // Concurrent verification execution
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
      assert.strictEqual(failCount, 1, 'The other concurrent buyer must fail due to stock depletion');

      const rareProd = await Product.findOne({ id: rareWatchId }).lean();
      assert.strictEqual(rareProd.stock, 0, 'Stock must be exactly 0, never negative');
      assert.ok(rareProd.stock >= 0, 'Negative stock strictly prevented');
    });

    // =========================================================================
    // TEST 14: Coupon Abuse Prevention
    // =========================================================================
    await test('14. Coupon Usage Limit Enforced & Incremented Only on Completion', async () => {
      // In Test 1, testCouponCode (limit 1) was used and completed.
      const couponDoc = await Coupon.findOne({ code: testCouponCode }).lean();
      assert.strictEqual(couponDoc.timesUsed, 1, 'Coupon timesUsed must be exactly 1 after 1 verified order');

      // Attempt to use the coupon again on a new order
      const prod3Id = `prod-sec3-${timestamp}`;
      await Product.create({
        id: prod3Id,
        name: 'Rolex Daytona Gold',
        brand: 'Rolex',
        category: "Men's Luxury",
        sku: `SKU-ROL-${timestamp}`,
        price: 100000,
        stock: 5,
        active: true
      });

      const initRes = await testRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: prod3Id, quantity: 1 }],
          couponCode: testCouponCode
        })
      });

      assert.strictEqual(initRes.status, 200);
      // Coupon limit exceeded -> discountAmount must be 0!
      assert.strictEqual(initRes.data.calculatedSummary.discountAmount, 0, 'Exhausted coupon must grant 0 discount');
    });

    // =========================================================================
    // TEST 15: Invalid Webhook Signature
    // =========================================================================
    await test('15. Invalid Webhook Signature Rejected (400 Bad Request)', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: `pay_hook_${timestamp}`, order_id: `order_hook_${timestamp}`, amount: 100000 }
          }
        }
      };

      const res = await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': 'invalid_signature_hash_12345' },
        body: JSON.stringify(webhookPayload)
      });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    // =========================================================================
    // TEST 16: Duplicate Webhook Idempotency
    // =========================================================================
    await test('16. Valid Webhook Processing & Idempotency', async () => {
      const hookGw = `order_hook_${Date.now()}`;
      const hookPay = `pay_hook_${Date.now()}`;

      // Create a pending payment
      await Payment.create({
        transactionId: `TXN-HOOK-${Date.now()}`,
        gatewayOrderId: hookGw,
        amount: 50000,
        currency: 'INR',
        status: 'created',
        subtotal: 50000,
        total: 50000,
        items: [{ id: testProd2Id, name: 'AP Watch', price: 50000, quantity: 1 }],
        customer: {
          fullName: 'Hook Client',
          email: 'hook@luxurywatch.com',
          phone: '+91 98200 98200',
          address: 'The Capital, BKC',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          country: 'India'
        }
      });

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: hookPay, order_id: hookGw, amount: 5000000 }
          }
        }
      };

      const validSig = generateWebhookSignature(webhookPayload, testWebhookSecret);

      // First webhook
      const res1 = await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': validSig },
        body: JSON.stringify(webhookPayload)
      });
      assert.strictEqual(res1.status, 200, `Webhook error: ${JSON.stringify(res1.data)}`);

      // Duplicate webhook
      const res2 = await testRequest('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'X-Razorpay-Signature': validSig },
        body: JSON.stringify(webhookPayload)
      });
      assert.strictEqual(res2.status, 200);
      assert.ok(res2.data.message?.includes('idempotent') || res2.data.received);
    });

    // =========================================================================
    // TEST 17: Unauthorized Order Access & Privacy Controls
    // =========================================================================
    await test('17. Order Privacy Controls: Public Lookup Sanitizes Private Data', async () => {
      const privateEmail = `private.${timestamp}@luxurywatch.com`;
      const secretAddress = 'Private Villa 42, Super Secret Estate, Malabar Hill';
      const secretPhone = '+91 99999 11111';

      const privateOrder = await Order.create({
        id: `ORD-PRIV-${timestamp}`,
        orderNumber: `ORD-PRIV-${timestamp}`,
        customer: {
          fullName: 'Billionaire Collector',
          email: privateEmail,
          phone: secretPhone,
          address: secretAddress,
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400006'
        },
        items: [{ id: testProd2Id, name: 'AP Watch', price: 180000, quantity: 1 }],
        subtotal: 180000,
        total: 180000,
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        trackingNumber: `LW-PRIV-${timestamp}`,
        paymentDetails: { paymentId: 'pay_secret_123', signature: 'sig_secret_456' }
      });

      // 1. Unauthenticated / Public lookup
      const publicRes = await testRequest(`/orders/${privateOrder.id}`);
      assert.strictEqual(publicRes.status, 200);
      assert.strictEqual(publicRes.data.isSanitized, true);
      assert.strictEqual(publicRes.data.order.customer.address, undefined, 'Street address must NOT be exposed to public');
      assert.strictEqual(publicRes.data.order.customer.email, undefined, 'Customer email must NOT be exposed to public');
      assert.strictEqual(publicRes.data.order.customer.phone, undefined, 'Customer phone must NOT be exposed to public');
      assert.strictEqual(publicRes.data.order.paymentDetails, undefined, 'Payment details must NOT be exposed to public');
      assert.strictEqual(publicRes.data.order.customer.maskedName, 'B***', 'Name must be masked in public tracking');

      // 2. Admin lookup has full access
      const adminToken = generateToken({
        id: 'adm-1',
        email: env.ADMIN_EMAIL || 'luxury.watch.store2020@gmail.com',
        role: 'admin'
      });

      const adminRes = await testRequest(`/orders/${privateOrder.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(adminRes.status, 200);
      assert.strictEqual(adminRes.data.order.customer.address, secretAddress);
      assert.strictEqual(adminRes.data.order.customer.email, privateEmail);

      // 3. Customer owner lookup has full access
      const ownerToken = generateToken({
        id: 'usr-priv-1',
        email: privateEmail,
        role: 'customer'
      });

      const ownerRes = await testRequest(`/orders/${privateOrder.id}`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      assert.strictEqual(ownerRes.status, 200);
      assert.strictEqual(ownerRes.data.order.customer.address, secretAddress);
    });

    // =========================================================================
    // TEST 18: Secrets Never Exposed in Settings API
    // =========================================================================
    await test('18. Razorpay Key Secret & Webhook Secret Never Exposed in API', async () => {
      const adminToken = generateToken({
        id: 'adm-1',
        email: env.ADMIN_EMAIL || 'luxury.watch.store2020@gmail.com',
        role: 'admin'
      });

      const settingsRes = await testRequest('/settings/payment', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      assert.strictEqual(settingsRes.status, 200);
      assert.strictEqual(settingsRes.data.settings.razorpayKeySecret, undefined, 'razorpayKeySecret must be omitted');
      assert.strictEqual(settingsRes.data.settings.razorpayWebhookSecret, undefined, 'razorpayWebhookSecret must be omitted');
      assert.strictEqual(typeof settingsRes.data.settings.isSecretConfigured, 'boolean');
      assert.strictEqual(typeof settingsRes.data.settings.isWebhookConfigured, 'boolean');
    });

  } catch (fatalErr) {
    console.error('Fatal Test Exception:', fatalErr);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`📊 PAYMENT SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runPaymentSecurityTestSuite();
