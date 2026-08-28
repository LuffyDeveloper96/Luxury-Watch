import http from 'http';
import crypto from 'crypto';
import './index.js';
import { getDevOtpSession } from './services/otpService.js';
import { env } from './config/env.js';
import { connectMongoDB } from './config/db.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));
  console.log('\n🚀 Starting LUXURY WATCH Production API Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await testRequest('/health');
    assert(health.ok && health.data.status === 'online', '1. System Health Check (/api/health)');

    // 2. Products API
    const prods = await testRequest('/products');
    assert(prods.ok && Array.isArray(prods.data.products) && prods.data.products.length > 0, '2. Products Catalog API (/api/products)', `Count: ${prods.data.count}`);

    // 3. Brands API
    const brands = await testRequest('/brands');
    assert(brands.ok && Array.isArray(brands.data.brands) && brands.data.brands.length >= 8, '3. Dynamic Brands Showcase API (/api/brands)', `Brands count: ${brands.data.count}`);

    // 4. Categories API
    const cats = await testRequest('/categories');
    assert(cats.ok && Array.isArray(cats.data.categories), '4. Categories API (/api/categories)');

    // 5. Patron Registration (Email + Password + OTP)
    const testUserEmail = `patron.${Date.now()}@luxurywatch.com`;
    const signupInitRes = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lord Sterling',
        email: testUserEmail,
        password: 'LuxuryPatron2026!',
        phone: '+91 98200 98200'
      })
    });
    assert(signupInitRes.ok && signupInitRes.data.success && signupInitRes.data.step === 'otp', '5. Initiate Patron Sign Up with Email + Password (/api/auth/user/signup/init)');

    const signupSession = getDevOtpSession(testUserEmail);
    const signupOtp = signupSession ? signupSession.rawOtp : '';
    const signupVerifyRes = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, otp: signupOtp })
    });
    assert(signupVerifyRes.ok && signupVerifyRes.data.token, '6. Verify Sign Up 6-Digit OTP & Register User (/api/auth/user/signup/verify)');
    const userToken = signupVerifyRes.data.token;

    // 7. Patron Login (Email + Password -> 2FA OTP)
    const loginInitRes = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: 'LuxuryPatron2026!'
      })
    });
    assert(loginInitRes.ok && loginInitRes.data.success && loginInitRes.data.step === 'otp', '7. Initiate Sign In with Password -> Send 2FA OTP (/api/auth/user/login/init)');

    const loginSession = getDevOtpSession(testUserEmail);
    const loginOtp = loginSession ? loginSession.rawOtp : '';
    const loginVerifyRes = await testRequest('/auth/user/login/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, otp: loginOtp })
    });
    assert(loginVerifyRes.ok && loginVerifyRes.data.token, '8. Verify 2FA OTP & Authenticate Session (/api/auth/user/login/verify)');

    // 9. Coupon Validation
    const couponRes = await testRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'LUXE10', subtotal: 50000 })
    });
    assert(couponRes.ok && couponRes.data.discountAmount > 0, '9. Coupon Engine Validation (/api/coupons/validate)');

    // 10. Razorpay Payment Order Init
    const firstProd = prods.data.products.find(p => p.stock > 0) || prods.data.products[0];
    const initialStock = firstProd.stock;
    const paymentOrderRes = await testRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: firstProd.id, quantity: 1 }],
        couponCode: 'LUXE10'
      })
    });
    assert(paymentOrderRes.ok && paymentOrderRes.data.gatewayOrderId, '10. Razorpay Order Creation (/api/payments/razorpay/order)');

    // 11. Razorpay Payment Verification & Consignment Creation
    const testPayId = `pay_test_${Date.now()}`;
    const testSecret = env.RAZORPAY_KEY_SECRET || 'fwY1luM7zPSjySlGLatA4tf8';
    const realSig = crypto.createHmac('sha256', testSecret).update(`${paymentOrderRes.data.gatewayOrderId}|${testPayId}`).digest('hex');

    const verifyPaymentRes = await testRequest('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({
        gatewayOrderId: paymentOrderRes.data.gatewayOrderId,
        paymentId: testPayId,
        signature: realSig,
        orderData: {
          items: [{ id: firstProd.id, name: firstProd.name, price: firstProd.price, quantity: 1 }],
          customer: {
            fullName: 'Lord Sterling',
            email: testUserEmail,
            phone: '+91 98200 98200',
            address: 'The Capital, BKC',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400051'
          },
          total: paymentOrderRes.data.calculatedSummary.total
        }
      })
    });
    assert(verifyPaymentRes.ok && verifyPaymentRes.data.order?.id, '11. Razorpay Signature Verification & Order Creation (/api/payments/razorpay/verify)');

    // 12. Verify Stock Decrement
    const updatedProdRes = await testRequest(`/products/${firstProd.id}`);
    assert(updatedProdRes.ok && updatedProdRes.data.product.stock === initialStock - 1, '12. Atomic Inventory Stock Decrement Verification');

    // 13. Consignment Tracking
    const orderId = verifyPaymentRes.data.order.id;
    const trackingRes = await testRequest(`/orders/${orderId}`);
    assert(trackingRes.ok && trackingRes.data.order.trackingNumber, '13. Consignment Tracking Lookup (/api/orders/:id)');

    // 14. Single Master Admin Authentication
    const adminLoginRes = await testRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: 'LuxuryWatch2026!'
      })
    });
    assert(adminLoginRes.ok && adminLoginRes.data.token, '14. Single Master Admin Authentication (/api/auth/admin/login)');
    const adminToken = adminLoginRes.data.token;

    // 15. Admin Summary & Analytics
    const adminSummaryRes = await testRequest('/analytics/summary', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminSummaryRes.ok && adminSummaryRes.data.metrics?.totalRevenue !== undefined, '15. Admin Analytics & Financial Metrics (/api/analytics/summary)');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`📊 Test Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite();
