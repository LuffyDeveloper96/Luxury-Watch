import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import router from './routes/api.js';
import { env } from './config/env.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);

const PORT = 5055;
const server = app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🧪 Testing Razorpay Standard Checkout Integration`);
  console.log(`   Backend URL: http://127.0.0.1:${PORT}/api`);
  console.log(`   Key ID: ${env.RAZORPAY_KEY_ID}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} - ${details}`);
      failed++;
    }
  };

  const BASE_URL = `http://127.0.0.1:${PORT}/api`;

  try {
    // 1. Test POST /api/create-order with direct amount (50000 paise = ₹500)
    console.log('--- 1. Testing POST /api/create-order (Direct Order Creation) ---');
    const orderRes = await fetch(`${BASE_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50000,
        currency: 'INR',
        receipt: `test_rcpt_${Date.now()}`
      })
    });
    const orderData = await orderRes.json();
    assert(
      orderRes.ok && orderData.success && orderData.order_id && orderData.amount === 50000 && orderData.currency === 'INR',
      'POST /api/create-order creates real Razorpay order',
      JSON.stringify(orderData)
    );
    const createdOrderId = orderData.order_id;
    console.log(`     Created Razorpay Order ID: ${createdOrderId}`);

    // 2. Test Minimum Amount Validation (< 100 paise)
    console.log('\n--- 2. Testing Minimum Amount Validation (< 100 paise) ---');
    const minAmountRes = await fetch(`${BASE_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50, // 50 paise is less than minimum 100 paise
        currency: 'INR'
      })
    });
    const minAmountData = await minAmountRes.json();
    assert(
      minAmountRes.status === 400 && !minAmountData.success,
      'POST /api/create-order rejects amount < 100 paise with status 400',
      `Status: ${minAmountRes.status}, Message: ${minAmountData.message}`
    );

    // 3. Test Missing Payload Validation
    console.log('\n--- 3. Testing Missing Payload Validation ---');
    const emptyRes = await fetch(`${BASE_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(
      emptyRes.status === 400,
      'POST /api/create-order rejects empty body with status 400'
    );

    // 4. Test Valid Signature Verification on POST /api/verify-payment
    console.log('\n--- 4. Testing POST /api/verify-payment (Cryptographic HMAC-SHA256 Verification) ---');
    const mockPaymentId = `pay_${Date.now()}_test`;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${createdOrderId}|${mockPaymentId}`)
      .digest('hex');

    const verifyRes = await fetch(`${BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId,
        payment_id: mockPaymentId,
        signature: validSignature
      })
    });
    const verifyData = await verifyRes.json();
    assert(
      verifyRes.ok && verifyData.success,
      'POST /api/verify-payment verifies valid HMAC-SHA256 signature',
      JSON.stringify(verifyData)
    );

    // 5. Test Signature Mismatch Protection on POST /api/verify-payment
    console.log('\n--- 5. Testing Signature Mismatch Protection ---');
    const forgedSignature = 'forged_invalid_signature_hex_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const failVerifyRes = await fetch(`${BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId,
        payment_id: mockPaymentId,
        signature: forgedSignature
      })
    });
    const failVerifyData = await failVerifyRes.json();
    assert(
      failVerifyRes.status === 400 && !failVerifyData.success,
      'POST /api/verify-payment rejects tampered signature with status 400',
      `Status: ${failVerifyRes.status}, Message: ${failVerifyData.message}`
    );

    // 6. Test Missing Fields on Verification Endpoint
    console.log('\n--- 6. Testing Missing Verification Fields ---');
    const missingFieldRes = await fetch(`${BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId
        // Missing payment_id and signature
      })
    });
    assert(
      missingFieldRes.status === 400,
      'POST /api/verify-payment rejects missing payment_id / signature with status 400'
    );

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n======================================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
});
