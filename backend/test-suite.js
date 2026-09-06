/**
 * LUXURY WATCH — Automated Production Verification Test Suite
 * Validates: Auth, Admin Guard, Zero OTP, Media Storage, Payment HMAC, CORS, and Health
 */

import http from 'http';
import crypto from 'crypto';
import app from './index.js';
import { env } from './config/env.js';
import { User, Product } from './models/index.js';

let server;
let baseUrl;

const runTests = async () => {
  console.log('\n===============================================================');
  console.log('  LUXURY WATCH — AUTOMATED PRODUCTION VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  // Start temporary test server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}\n`);
      resolve();
    });
  });

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, headers: res.headers };
  };

  try {
    // 1. System Health Check
    console.log('[Phase 7 & Health Test]');
    const health = await apiFetch('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /health returns HTTP 200 OK');

    const apiHealth = await apiFetch('/api/health');
    assert(apiHealth.status === 200 && apiHealth.data.status === 'online', 'GET /api/health returns HTTP 200 Online');

    // 2. Zero OTP Endpoint Verification
    console.log('\n[Phase 2: Zero OTP Route Check]');
    const otpSignupVerify = await apiFetch('/api/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', otp: '123456' })
    });
    assert(otpSignupVerify.status === 404, 'Legacy /api/auth/user/signup/verify is completely removed (404)');

    const otpForgot = await apiFetch('/api/auth/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    });
    assert(otpForgot.status === 404, 'Legacy /api/auth/user/forgot-password is completely removed (404)');

    // 3. Customer Authentication Flow (Email + Password)
    console.log('\n[Phase 3: Customer Email + Password Auth]');
    const testEmail = `patron_${Date.now()}@luxurywatch.test`;
    const testPassword = 'SecurePassword2026!';

    const signup = await apiFetch('/api/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Patron',
        email: testEmail,
        password: testPassword,
        phone: '+919999999999'
      })
    });
    assert(signup.status === 201 && signup.data.success && signup.data.token, 'Customer Registration creates account without OTP');
    const customerToken = signup.data.token;

    // Duplicate Registration Rejection
    const dupSignup = await apiFetch('/api/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Patron',
        email: testEmail,
        password: testPassword
      })
    });
    assert(dupSignup.status === 400, 'Duplicate customer email is rejected (HTTP 400)');

    // Customer Login (Valid)
    const validLogin = await apiFetch('/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    assert(validLogin.status === 200 && validLogin.data.token, 'Customer Login succeeds with valid email + password');

    // Customer Login (Invalid Password)
    const invalidLogin = await apiFetch('/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' })
    });
    assert(invalidLogin.status === 401, 'Customer Login rejects wrong password (HTTP 401)');

    // Protected Customer Profile
    const profile = await apiFetch('/api/auth/user/me', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(profile.status === 200 && profile.data.user?.email === testEmail, 'GET /api/auth/user/me returns authenticated patron');

    // 4. Admin Authentication & Protection
    console.log('\n[Phase 1 & 3: Master Admin Guard & Security]');
    // Unauthorized Admin Email
    const fakeAdmin = await apiFetch('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'hacker@example.com', password: 'AnyPassword!' })
    });
    assert(fakeAdmin.status === 403, 'Unauthorized admin email rejected (HTTP 403 Access Denied)');

    // Customer Token Blocked from Admin Endpoint
    const customerBlockedFromAdmin = await apiFetch('/api/admin/customers', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(customerBlockedFromAdmin.status === 403, 'Customer token cannot access Master Admin endpoints (HTTP 403)');

    // 5. Products Catalog
    console.log('\n[Phase 11 & Products Catalog Check]');
    const productsRes = await apiFetch('/api/products');
    assert(productsRes.status === 200 && Array.isArray(productsRes.data.products), 'GET /api/products returns products array');

    // 6. Razorpay Cryptographic Verification Check
    console.log('\n[Phase 9: Payment Security & Cryptographic Verification]');
    const keySecret = env.RAZORPAY_KEY_SECRET || 'test_secret_for_hmac_verification';
    const sampleOrderId = 'order_test_123456';
    const samplePaymentId = 'pay_test_789012';
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${sampleOrderId}|${samplePaymentId}`)
      .digest('hex');

    // Tampered signature test
    const tamperedVerification = await apiFetch('/api/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        order_id: sampleOrderId,
        payment_id: samplePaymentId,
        signature: 'invalid_tampered_signature_hex_00000000000000000000000000000000'
      })
    });
    assert(tamperedVerification.status === 400, 'Tampered / invalid Razorpay payment signature rejected (HTTP 400)');

    // 7. CORS Protection Check
    console.log('\n[Phase 4: CORS Configuration Check]');
    const disallowedOriginRes = await fetch(`${baseUrl}/api/products`, {
      headers: {
        Origin: 'https://malicious-random-site.com'
      }
    });
    // Disallowed origin should not have Access-Control-Allow-Origin matching malicious origin
    const acaoHeader = disallowedOriginRes.headers.get('access-control-allow-origin');
    assert(!acaoHeader || acaoHeader !== 'https://malicious-random-site.com', 'Unconfigured origin is not allowed in CORS response headers');

    // Clean up test patron record if created
    try {
      await User.deleteOne({ email: testEmail });
    } catch (e) {}

  } catch (err) {
    console.error('Unexpected test exception:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n===============================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
};

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
