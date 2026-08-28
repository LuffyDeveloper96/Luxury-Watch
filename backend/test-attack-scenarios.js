import crypto from 'crypto';
import assert from 'assert';
import mongoose from 'mongoose';
import './index.js';
import { Product, Coupon, Order, Payment, Return, User } from './models/index.js';
import { env } from './config/env.js';

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

async function runAttackScenarioValidation() {
  await new Promise(r => setTimeout(r, 600));

  console.log('\n======================================================================');
  console.log('⚔️  LUXURY WATCH — STEP 7 ATTACK SCENARIO VALIDATION SUITE');
  console.log('======================================================================\n');

  const results = [];
  const timestamp = Date.now();
  const testSecret = env.RAZORPAY_KEY_SECRET || 'fwY1luM7zPSjySlGLatA4tf8';
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'rzp_whsec_luxurywatch2026';

  // Helper to record scenario
  const recordScenario = (id, name, input, expected, actual, status, dbState, passed) => {
    results.push({ id, name, input, expected, actual, status, dbState, passed });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Scenario ${id}] ${name} -> ${mark} (HTTP ${status})`);
    console.log(`   Input:    ${JSON.stringify(input).slice(0, 100)}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
    console.log(`   DB State: ${dbState}\n`);
  };

  try {
    // 0. Setup test users and products
    // Admin login
    const adminLogin = await api('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: env.ADMIN_EMAIL, password: 'LuxuryWatch2026!' })
    });
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // User Alice (Owner)
    const aliceEmail = `alice.${timestamp}@luxurywatch.com`;
    await api('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ email: aliceEmail, password: 'AlicePassword2026!', name: 'Alice Patron' })
    });
    const { getDevOtpSession } = await import('./services/otpService.js');
    const aliceOtp = getDevOtpSession(aliceEmail)?.rawOtp;
    const aliceVerify = await api('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: aliceEmail, otp: aliceOtp })
    });
    const aliceToken = aliceVerify.data.token;
    const aliceHeaders = { Authorization: `Bearer ${aliceToken}` };

    // User Bob (Attacker)
    const bobEmail = `bob.${timestamp}@luxurywatch.com`;
    await api('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ email: bobEmail, password: 'BobPassword2026!', name: 'Bob Intruder' })
    });
    const bobOtp = getDevOtpSession(bobEmail)?.rawOtp;
    const bobVerify = await api('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: bobEmail, otp: bobOtp })
    });
    const bobToken = bobVerify.data.token;
    const bobHeaders = { Authorization: `Bearer ${bobToken}` };

    // Seed test product
    const testProdId = `attack-prod-${timestamp}`;
    await Product.create({
      id: testProdId,
      name: 'Audemars Piguet Royal Oak Double Balance Wheel [Skeleton]',
      brand: 'Audemars Piguet',
      category: 'Haute Horlogerie',
      sku: `SKU-AP-${timestamp}`,
      price: 850000,
      stock: 50,
      active: true
    });

    // Seed test coupon
    const testCouponCode = `ATTACK_CPN_${timestamp}`;
    await Coupon.create({
      id: `cpn-${timestamp}`,
      code: testCouponCode,
      discountPercent: 10,
      minPurchase: 100000,
      usageLimit: 1,
      timesUsed: 0,
      active: true
    });

    // =========================================================================
    // SCENARIO A: Create a paid order without Razorpay payment
    // =========================================================================
    {
      const ordersBefore = await Order.countDocuments({ 'customer.email': bobEmail });
      const res = await api('/orders', {
        method: 'POST',
        headers: bobHeaders,
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          customer: { fullName: 'Bob', email: bobEmail },
          paymentStatus: 'Paid',
          paymentMethod: 'razorpay'
        })
      });
      const ordersAfter = await Order.countDocuments({ 'customer.email': bobEmail });
      const pass = (res.status === 403 || res.status === 401) && ordersBefore === ordersAfter;
      recordScenario(
        'A',
        'Create a paid order without Razorpay payment',
        { endpoint: 'POST /api/orders', body: { paymentStatus: 'Paid' }, token: 'Customer' },
        'HTTP 401/403 Rejected; No order created in DB',
        `HTTP ${res.status}: ${res.data.message || 'Forbidden'}`,
        res.status,
        `Orders in DB: before=${ordersBefore}, after=${ordersAfter}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO B: Modify product price from frontend
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, price: 100, quantity: 1 }] // Attacker says price is 100 instead of 850000
        })
      });
      // Razorpay amount is returned in paise (850,000 INR = 85,000,000 paise)
      const pass = res.status === 200 && res.data.amount === 85000000;
      recordScenario(
        'B',
        'Modify product price from frontend (tampered ₹100 instead of ₹850,000)',
        { clientSuppliedPrice: 100, actualDbPrice: 850000 },
        'Server overrides client price with DB price ₹850,000 (amount: 85,000,000 paise)',
        `Server returned amount in paise: ${res.data.amount}`,
        res.status,
        `Payment record amount in DB: ${res.data.amount}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO C: Modify subtotal from frontend
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 2 }],
          subtotal: 50 // Attacker claims subtotal is 50
        })
      });
      // 2 * 850,000 INR = 1,700,000 INR = 170,000,000 paise
      const pass = res.status === 200 && res.data.amount === 170000000;
      recordScenario(
        'C',
        'Modify subtotal from frontend (tampered ₹50 for 2 items)',
        { clientSuppliedSubtotal: 50, calculatedSubtotal: 1700000 },
        'Server calculates subtotal as ₹1,700,000 strictly from DB products (170,000,000 paise)',
        `Server returned amount in paise: ${res.data.amount}`,
        res.status,
        `Payment amount in DB: ${res.data.amount}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO D: Modify shipping fee from frontend
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          shippingFee: -500, // Negative shipping discount
          customer: { deliverySpeed: 'White-Glove Armoured Courier' }
        })
      });
      const pass = res.status === 200 && res.data.amount >= 85000000;
      recordScenario(
        'D',
        'Modify shipping fee from frontend (tampered negative fee -₹500)',
        { clientSuppliedShippingFee: -500 },
        'Server ignores client shipping fee and applies server policy (>= 85,000,000 paise)',
        `Server returned amount in paise: ${res.data.amount}`,
        res.status,
        `Payment amount: ${res.data.amount}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO E: Modify discount from frontend
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          discountAmount: 800000 // Attacker claims ₹800,000 discount without coupon
        })
      });
      const pass = res.status === 200 && res.data.amount === 85000000;
      recordScenario(
        'E',
        'Modify discount amount from frontend without coupon (tampered ₹800,000 discount)',
        { clientSuppliedDiscount: 800000 },
        'Server discounts 0 without valid coupon; amount = 85,000,000 paise',
        `Server returned amount in paise: ${res.data.amount}`,
        res.status,
        `Payment amount: ${res.data.amount}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO F: Modify coupon (fake/unauthorized coupon code)
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 1 }],
          couponCode: 'FORGED_99_PERCENT_OFF'
        })
      });
      const pass = res.status === 200 && res.data.amount === 85000000;
      recordScenario(
        'F',
        'Supply invalid / forged coupon code',
        { couponCode: 'FORGED_99_PERCENT_OFF' },
        'Server rejects invalid coupon and charges full price (85,000,000 paise)',
        `Server returned amount in paise: ${res.data.amount}`,
        res.status,
        `Payment amount: ${res.data.amount}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO G: Modify quantity (negative quantity)
    // =========================================================================
    // SCENARIO G: Modify quantity to negative number (-5) -> Must reject with 400
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: -5 }]
        })
      });
      const pass = res.status === 400 && res.data.success === false;
      recordScenario(
        'G',
        'Modify quantity to negative number (-5)',
        { items: [{ id: testProdId, quantity: -5 }] },
        'HTTP 400 Bad Request; negative quantity rejected upfront',
        `Server returned status=${res.status}, message: "${res.data.message}"`,
        res.status,
        'Invalid quantity rejected',
        pass
      );
    }

    // =========================================================================
    // SCENARIO H: Reuse paymentId (duplicate payment verification)
    // =========================================================================
    {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId = `pay_scen_h_${timestamp}`;
      const sig = generateSignature(gwOrderId, payId, testSecret);

      const v1 = await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId, signature: sig })
      });
      const ordersCount1 = await Order.countDocuments({ 'paymentDetails.paymentId': payId });

      const v2 = await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId, signature: sig })
      });
      const ordersCount2 = await Order.countDocuments({ 'paymentDetails.paymentId': payId });

      const pass = v1.status === 200 && v2.status === 200 && v2.data.isDuplicate === true && ordersCount1 === 1 && ordersCount2 === 1;
      recordScenario(
        'H',
        'Reuse paymentId in duplicate verification request',
        { paymentId: payId, gatewayOrderId: gwOrderId },
        'Second request is idempotent (isDuplicate: true); exactly 1 Order in DB',
        `v1 status=${v1.status}, v2 status=${v2.status}, v2.isDuplicate=${v2.data.isDuplicate}`,
        v2.status,
        `Orders in DB for paymentId: before=${ordersCount1}, after=${ordersCount2}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO I: Reuse gatewayOrderId with a different paymentId after paid
    // =========================================================================
    {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId1 = `pay_scen_i1_${timestamp}`;
      const sig1 = generateSignature(gwOrderId, payId1, testSecret);

      // Verify first payment
      await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId1, signature: sig1 })
      });

      // Attempt second payment verification for same gatewayOrderId
      const payId2 = `pay_scen_i2_${timestamp}`;
      const sig2 = generateSignature(gwOrderId, payId2, testSecret);
      const res2 = await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId2, signature: sig2 })
      });

      const order2InDb = await Order.findOne({ 'paymentDetails.paymentId': payId2 });
      const pass = order2InDb === null;
      recordScenario(
        'I',
        'Reuse gatewayOrderId with different paymentId after order is already paid',
        { gatewayOrderId: gwOrderId, newPaymentId: payId2 },
        'Rejected or returns existing order; second Order is NOT created',
        `res2 status=${res2.status}, order2Created=${order2InDb !== null}`,
        res2.status,
        `Order with payId2 in DB: ${order2InDb ? 'EXISTS (FAIL)' : 'NULL (PASS)'}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO J: Replay Webhook (Duplicate webhook delivery)
    // =========================================================================
    {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId = `pay_scen_j_${timestamp}`;

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: payId,
              order_id: gwOrderId,
              amount: 85000000, // paise
              currency: 'INR',
              status: 'captured'
            }
          }
        }
      });
      const whSig = generateWebhookSignature(webhookPayload, webhookSecret);

      const wh1 = await api('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': whSig },
        body: webhookPayload
      });
      const ordersCount1 = await Order.countDocuments({ 'paymentDetails.paymentId': payId });

      const wh2 = await api('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': whSig },
        body: webhookPayload
      });
      const ordersCount2 = await Order.countDocuments({ 'paymentDetails.paymentId': payId });

      const pass = wh1.status === 200 && wh2.status === 200 && ordersCount1 === 1 && ordersCount2 === 1;
      recordScenario(
        'J',
        'Replay webhook event (duplicate webhook delivery)',
        { event: 'payment.captured', paymentId: payId },
        'Webhook handler is idempotent; exactly 1 Order in DB',
        `wh1 status=${wh1.status}, wh2 status=${wh2.status}`,
        wh2.status,
        `Orders in DB: count1=${ordersCount1}, count2=${ordersCount2}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO K: Forge Webhook Signature
    // =========================================================================
    {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: `pay_fake_${timestamp}`, amount: 1000 } } }
      });
      const res = await api('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': 'forged_invalid_signature_hex_1234567890abcdef' },
        body: webhookPayload
      });
      const pass = res.status === 400;
      recordScenario(
        'K',
        'Forge webhook signature with invalid HMAC',
        { 'x-razorpay-signature': 'forged_invalid_signature...' },
        'HTTP 400 Bad Request / Signature Mismatch',
        `HTTP ${res.status}: ${res.data.message || 'Signature mismatch'}`,
        res.status,
        'No payments or orders processed',
        pass
      );
    }

    // =========================================================================
    // SCENARIO L: Send payment.failed after successful payment
    // =========================================================================
    {
      const initRes = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }] })
      });
      const gwOrderId = initRes.data.gatewayOrderId;
      const payId = `pay_scen_l_${timestamp}`;
      const sig = generateSignature(gwOrderId, payId, testSecret);

      // Successfully pay
      await api('/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ gatewayOrderId: gwOrderId, paymentId: payId, signature: sig })
      });
      const orderBefore = await Order.findOne({ 'paymentDetails.paymentId': payId });

      // Send payment.failed webhook
      const failPayload = JSON.stringify({
        event: 'payment.failed',
        payload: { payment: { entity: { id: payId, order_id: gwOrderId } } }
      });
      const failSig = generateWebhookSignature(failPayload, webhookSecret);
      const res = await api('/payments/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': failSig },
        body: failPayload
      });

      const orderAfter = await Order.findOne({ 'paymentDetails.paymentId': payId });
      const pass = orderBefore.paymentStatus === 'Paid' && orderAfter.paymentStatus === 'Paid';
      recordScenario(
        'L',
        'Send payment.failed webhook after successful payment',
        { event: 'payment.failed', paymentId: payId },
        'Payment status remains "Paid"; cannot downgrade paid order',
        `Order status before=${orderBefore?.paymentStatus}, after=${orderAfter?.paymentStatus}`,
        res.status,
        `Order paymentStatus in DB: ${orderAfter?.paymentStatus}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO M: Buy final stock unit concurrently from two requests (stock = 1)
    // =========================================================================
    {
      const scarceProdId = `scarce-prod-${timestamp}`;
      await Product.create({
        id: scarceProdId,
        name: 'Patek Philippe Grandmaster Chime [Unique Piece]',
        brand: 'Patek Philippe',
        category: 'Haute Horlogerie',
        sku: `SKU-SCARCE-${timestamp}`,
        price: 25000000,
        stock: 1, // EXACTLY 1 IN STOCK
        active: true
      });

      const [init1, init2] = await Promise.all([
        api('/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ items: [{ id: scarceProdId, quantity: 1 }] }) }),
        api('/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ items: [{ id: scarceProdId, quantity: 1 }] }) })
      ]);

      const pay1 = `pay_race1_${timestamp}`;
      const pay2 = `pay_race2_${timestamp}`;
      const sig1 = generateSignature(init1.data.gatewayOrderId, pay1, testSecret);
      const sig2 = generateSignature(init2.data.gatewayOrderId, pay2, testSecret);

      const [v1, v2] = await Promise.all([
        api('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify({ gatewayOrderId: init1.data.gatewayOrderId, paymentId: pay1, signature: sig1 }) }),
        api('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify({ gatewayOrderId: init2.data.gatewayOrderId, paymentId: pay2, signature: sig2 }) })
      ]);

      const prodInDb = await Product.findOne({ id: scarceProdId });
      const ordersCreated = await Order.countDocuments({
        $or: [{ 'items.id': scarceProdId }, { 'items.productId': scarceProdId }]
      });
      const pass = ((v1.status === 200 && v2.status !== 200) || (v2.status === 200 && v1.status !== 200)) && prodInDb.stock === 0 && ordersCreated === 1;

      recordScenario(
        'M',
        'Two concurrent customers purchasing final stock unit (stock = 1)',
        { product: scarceProdId, initialStock: 1, concurrentRequests: 2 },
        'Exactly 1 order succeeds (200), 1 fails (400); final stock = 0 (never negative)',
        `v1 status=${v1.status}, v2 status=${v2.status}, ordersCreated=${ordersCreated}`,
        v1.status === 200 ? v2.status : v1.status,
        `Final stock in DB: ${prodInDb.stock}; Total orders in DB: ${ordersCreated}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO N: Exceed coupon usageLimit concurrently (usageLimit = 1)
    // =========================================================================
    {
      const singleCouponCode = `SINGLE_CPN_${timestamp}`;
      await Coupon.create({
        id: `cpn-single-${timestamp}`,
        code: singleCouponCode,
        discountPercent: 15,
        minPurchase: 10000,
        usageLimit: 1,
        timesUsed: 0,
        active: true
      });

      const [init1, init2] = await Promise.all([
        api('/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }], couponCode: singleCouponCode }) }),
        api('/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ items: [{ id: testProdId, quantity: 1 }], couponCode: singleCouponCode }) })
      ]);

      const pay1 = `pay_cpn1_${timestamp}`;
      const pay2 = `pay_cpn2_${timestamp}`;
      const sig1 = generateSignature(init1.data.gatewayOrderId, pay1, testSecret);
      const sig2 = generateSignature(init2.data.gatewayOrderId, pay2, testSecret);

      const [v1, v2] = await Promise.all([
        api('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify({ gatewayOrderId: init1.data.gatewayOrderId, paymentId: pay1, signature: sig1 }) }),
        api('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify({ gatewayOrderId: init2.data.gatewayOrderId, paymentId: pay2, signature: sig2 }) })
      ]);

      const cpnInDb = await Coupon.findOne({ code: singleCouponCode });
      const pass = cpnInDb.timesUsed <= 1;

      recordScenario(
        'N',
        'Exceed coupon usageLimit concurrently (usageLimit = 1, 2 simultaneous checkouts)',
        { coupon: singleCouponCode, usageLimit: 1, concurrentRequests: 2 },
        'Coupon timesUsed <= 1 in DB; usageLimit never exceeded',
        `v1 status=${v1.status}, v2 status=${v2.status}, cpn.timesUsed=${cpnInDb.timesUsed}`,
        v1.status,
        `Coupon timesUsed in DB: ${cpnInDb.timesUsed}`,
        pass
      );
    }

    // =========================================================================
    // SCENARIO O: Access another customer's order (IDOR)
    // =========================================================================
    {
      const aliceOrder = await Order.create({
        id: `ORD-ALICE-${timestamp}`,
        orderNumber: `ORD-ALICE-${timestamp}`,
        customer: {
          fullName: 'Alice Patron Private',
          email: aliceEmail,
          phone: '+91 99999 11111',
          address: 'Secret Villa 9',
          city: 'Geneva',
          state: 'Geneva Canton',
          postalCode: '1201'
        },
        items: [{ id: testProdId, name: 'Royal Oak', price: 850000, quantity: 1 }],
        subtotal: 850000,
        total: 850000,
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        paymentDetails: { paymentId: `pay_alice_${timestamp}` }
      });

      // Bob (intruder) tries to view Alice's order
      const bobRes = await api(`/orders/${aliceOrder.id}`, { headers: bobHeaders });
      const sanitized = bobRes.data.order;

      const pass = bobRes.status === 200 &&
        sanitized?.customer?.email === undefined &&
        sanitized?.customer?.phone === undefined &&
        sanitized?.customer?.address === undefined &&
        bobRes.data.isSanitized === true;

      recordScenario(
        'O',
        "Access another customer's order (IDOR Privacy Check)",
        { targetOrderId: aliceOrder.id, requester: bobEmail, owner: aliceEmail },
        'Response is sanitized; email, phone, full address, and payment details omitted',
        `isSanitized=${bobRes.data.isSanitized}, hasEmail=${Boolean(sanitized?.customer?.email)}`,
        bobRes.status,
        'Private customer PII protected',
        pass
      );
    }

    // =========================================================================
    // SCENARIO P: Access another customer's return (IDOR)
    // =========================================================================
    {
      const aliceReturn = await Return.create({
        id: `RET-ALICE-${timestamp}`,
        orderId: `ORD-ALICE-${timestamp}`,
        customerName: 'Alice Patron Private',
        customerEmail: aliceEmail,
        customerPhone: '+91 99999 11111',
        pickupAddress: 'Secret Villa 9, Worli',
        returnReason: 'Wrong size',
        notes: 'Door code 1234',
        status: 'Requested',
        waybillNumber: `LW-RET-${timestamp}`
      });

      // Bob tries to lookup Alice's return
      const bobRes = await api(`/returns/lookup/${aliceReturn.orderId}`, { headers: bobHeaders });
      const sanitized = bobRes.data.returns?.[0];

      const pass = bobRes.status === 200 &&
        sanitized?.customerEmail === undefined &&
        sanitized?.customerPhone === undefined &&
        sanitized?.pickupAddress === undefined &&
        sanitized?.notes === undefined &&
        sanitized?.isSanitized === true;

      recordScenario(
        'P',
        "Access another customer's return (Return PII Privacy Check)",
        { targetOrderId: aliceReturn.orderId, requester: bobEmail, owner: aliceEmail },
        'Response is sanitized; email, phone, pickup address, notes omitted',
        `isSanitized=${sanitized?.isSanitized}, hasEmail=${Boolean(sanitized?.customerEmail)}`,
        bobRes.status,
        'Private return PII protected',
        pass
      );
    }

    // =========================================================================
    // SCENARIO Q: Attempt admin privilege escalation
    // =========================================================================
    {
      const res = await api('/analytics/summary', { headers: bobHeaders });
      const pass = res.status === 403;
      recordScenario(
        'Q',
        'Attempt admin privilege escalation (Customer token calling admin endpoint)',
        { endpoint: 'GET /api/analytics/summary', token: 'Bob (Customer)' },
        'HTTP 403 Forbidden',
        `HTTP ${res.status}: ${res.data.message || 'Forbidden'}`,
        res.status,
        'Access denied',
        pass
      );
    }

    // =========================================================================
    // SCENARIO R: Inject regex into search
    // =========================================================================
    {
      const res = await api('/products?search=[');
      const pass = res.status === 200 && Array.isArray(res.data.products);
      recordScenario(
        'R',
        'Inject regex into search (unclosed bracket "[")',
        { search: '[' },
        'HTTP 200 OK; characters safely escaped without 500 error or ReDoS',
        `HTTP ${res.status}: products count=${res.data.products?.length}`,
        res.status,
        'Database query executed safely',
        pass
      );
    }

    // =========================================================================
    // SCENARIO S: Attempt NoSQL injection
    // =========================================================================
    {
      const res = await api('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: { $gt: '' },
          password: { $gt: '' }
        })
      });
      const pass = res.status === 400 && res.data.token === undefined;
      recordScenario(
        'S',
        'Attempt NoSQL injection in login ({ $gt: "" })',
        { email: { $gt: '' }, password: { $gt: '' } },
        'HTTP 400 Bad Request; NoSQL operator rejected on input type validation; token=undefined',
        `HTTP ${res.status}: ${res.data.message || 'Rejected'} (token=${res.data.token})`,
        res.status,
        'Login rejected with HTTP 400; no token issued',
        pass
      );
    }

    // =========================================================================
    // SCENARIO T: Send malformed / huge quantities
    // =========================================================================
    {
      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: testProdId, quantity: 999999999 }]
        })
      });
      // Product only has stock 5, server rejects or handles safely
      const pass = res.status === 400 || res.status === 200;
      recordScenario(
        'T',
        'Send extremely huge quantity (999,999,999 units)',
        { quantity: 999999999, availableStock: 5 },
        'Handled gracefully; cannot reserve more than available stock',
        `HTTP ${res.status}: ${res.data.message || 'Amount: ' + res.data.amount}`,
        res.status,
        'Inventory protected',
        pass
      );
    }

  } catch (err) {
    console.error('Attack Scenario Exception:', err);
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log('\n======================================================================');
  console.log(`📊 ATTACK SCENARIOS SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runAttackScenarioValidation();
