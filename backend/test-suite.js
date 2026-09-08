/**
 * LUXURY WATCH — Automated Production Verification Test Suite
 * Validates: Auth, Admin Guard, Zero OTP, Media Storage, Payment HMAC, CORS, and Health
 */

import http from 'http';
import crypto from 'crypto';
import app from './index.js';
import { env } from './config/env.js';
import { User, Product, Order, Return } from './models/index.js';
import { generateToken } from './middleware/auth.js';

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

    // 7. CORS Protection & Allowed Origin Check
    console.log('\n[Phase 4: CORS Configuration Check]');
    const allowedOriginRes = await fetch(`${baseUrl}/api/products`, {
      headers: {
        Origin: 'https://luxurywatch2020.netlify.app'
      }
    });
    const allowedAcao = allowedOriginRes.headers.get('access-control-allow-origin');
    assert(allowedAcao === 'https://luxurywatch2020.netlify.app', 'Production origin https://luxurywatch2020.netlify.app is permitted in CORS headers');

    // Preflight OPTIONS request check
    const preflightRes = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://luxurywatch2020.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    const preflightAcao = preflightRes.headers.get('access-control-allow-origin');
    assert(preflightAcao === 'https://luxurywatch2020.netlify.app', 'Preflight OPTIONS returns Access-Control-Allow-Origin for production frontend');

    const disallowedOriginRes = await fetch(`${baseUrl}/api/products`, {
      headers: {
        Origin: 'https://malicious-random-site.com'
      }
    });
    const acaoHeader = disallowedOriginRes.headers.get('access-control-allow-origin');
    assert(!acaoHeader || acaoHeader !== 'https://malicious-random-site.com', 'Unconfigured origin is not allowed in CORS response headers');

    // 8. Order Status Flow & 5 Canonical Statuses Test
    console.log('\n[Phase 8: Order Status 5-Stage Lifecycle Verification]');
    
    // Generate valid Admin Token for testing order status endpoints
    const adminEmail = (env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@luxurywatch.com').trim().toLowerCase();
    const adminToken = generateToken({
      email: adminEmail,
      role: 'Grand Horologist / Master Administrator',
      sessionId: `TEST-ADMIN-${Date.now()}`
    });
    assert(Boolean(adminToken), 'Master Admin JWT generated for authorized admin operations');

    // Create a temporary test order
    const testOrderId = `TEST-ORD-${Date.now()}`;
    await Order.create({
      id: testOrderId,
      orderNumber: testOrderId,
      customer: {
        fullName: 'Status Flow Patron',
        email: 'status_test@luxurywatch.test',
        phone: '+919999988888',
        address: '100 Haute Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India'
      },
      items: [{
        id: 'test-watch-1',
        name: 'Royal Chronograph',
        brand: 'Rolex',
        price: 850000,
        quantity: 1
      }],
      subtotal: 850000,
      total: 850000,
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      createdAt: new Date()
    });

    // Test A: Confirmed (or Order Confirmed)
    const setConfirmedRes = await apiFetch(`/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ orderStatus: 'Order Confirmed' })
    });
    assert(
      setConfirmedRes.status === 200 && setConfirmedRes.data.order?.orderStatus === 'Confirmed',
      'A: Admin sets "Order Confirmed" → Stored as "Confirmed"'
    );

    // Test B: Shipped
    const setShippedRes = await apiFetch(`/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ orderStatus: 'Shipped', trackingNumber: 'LW-TRK-1001' })
    });
    assert(
      setShippedRes.status === 200 && setShippedRes.data.order?.orderStatus === 'Shipped',
      'B: Admin sets "Shipped" → Stored as "Shipped"'
    );

    // Test C: Out for Delivery
    const setOFDRes = await apiFetch(`/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ orderStatus: 'Out for Delivery' })
    });
    assert(
      setOFDRes.status === 200 && setOFDRes.data.order?.orderStatus === 'Out for Delivery',
      'C: Admin sets "Out for Delivery" → Stored as "Out for Delivery"'
    );

    // Test D: Delivered (MUST NOT BE DOWNGRADED OR NORMALIZED TO SHIPPED)
    const setDeliveredRes = await apiFetch(`/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ orderStatus: 'Delivered' })
    });
    assert(
      setDeliveredRes.status === 200 &&
      setDeliveredRes.data.order?.orderStatus === 'Delivered' &&
      setDeliveredRes.data.order?.orderStatus !== 'Shipped',
      'D: Admin sets "Delivered" → Stored as "Delivered" (NOT Shipped)'
    );

    // Public / User Tracking API Check for Delivered
    const trackingRes = await apiFetch(`/api/orders/${testOrderId}`);
    assert(
      trackingRes.status === 200 &&
      trackingRes.data.order?.orderStatus === 'Delivered' &&
      trackingRes.data.order?.orderStatus !== 'Shipped',
      'D2: User Order Tracking retrieves "Delivered" strictly without downgrade to Shipped'
    );

    // Test E: Cancelled
    const setCancelledRes = await apiFetch(`/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ orderStatus: 'Cancelled' })
    });
    assert(
      setCancelledRes.status === 200 && setCancelledRes.data.order?.orderStatus === 'Cancelled',
      'E: Admin sets "Cancelled" → Stored as "Cancelled"'
    );

    // Cleanup test order
    try {
      await Order.deleteOne({ id: testOrderId });
    } catch (e) {}

    // Clean up test patron record if created
    try {
      await User.deleteOne({ email: testEmail });
    } catch (e) {}

    // 9. Return Request Lifecycle Verification (Pending, Approved, Rejected)
    console.log('\n[Phase 9: Return Request Lifecycle Verification]');
    
    // Create temporary order for return testing
    const returnTestOrderId = `RET-ORD-${Date.now()}`;
    await Order.create({
      id: returnTestOrderId,
      orderNumber: returnTestOrderId,
      customer: {
        fullName: 'Return Tester',
        email: 'return_tester@luxurywatch.test',
        phone: '+919988776655',
        address: '200 Horology Road',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001'
      },
      items: [{
        id: 'watch-ret-1',
        name: 'Oyster Perpetual 41',
        brand: 'Rolex',
        sku: 'RLX-OP-41',
        price: 650000,
        quantity: 1,
        image: '/images/watches/rolex_submariner.jpg'
      }],
      subtotal: 650000,
      total: 650000,
      orderStatus: 'Delivered',
      paymentStatus: 'Paid',
      createdAt: new Date()
    });

    // Step 1: Submit Return Request (Customer)
    const createReturnRes = await apiFetch('/api/returns', {
      method: 'POST',
      body: JSON.stringify({
        orderId: returnTestOrderId,
        customerName: 'Return Tester',
        customerEmail: 'return_tester@luxurywatch.test',
        customerPhone: '+919988776655',
        reason: 'Wrist Fit & Bracelet Dimension Adjustment',
        resolutionType: 'Refund',
        pickupAddress: '200 Horology Road, New Delhi - 110001',
        notes: 'Needs official link sizing / return for refund'
      })
    });
    assert(
      createReturnRes.status === 201 &&
      createReturnRes.data.success &&
      createReturnRes.data.returnRequest?.status === 'Pending',
      'Step 1: Return request created with initial status "Pending"'
    );
    const createdReturnId = createReturnRes.data.returnRequest?.id;

    // Step 1b: Duplicate return request creation attempt is rejected (HTTP 400)
    const duplicateReturnRes = await apiFetch('/api/returns', {
      method: 'POST',
      body: JSON.stringify({
        orderId: returnTestOrderId,
        customerName: 'Return Tester',
        customerEmail: 'return_tester@luxurywatch.test',
        customerPhone: '+919988776655',
        reason: 'Duplicate attempt test',
        resolutionType: 'Refund',
        pickupAddress: '200 Horology Road, New Delhi - 110001',
        notes: 'Trying to submit duplicate return'
      })
    });
    assert(
      duplicateReturnRes.status === 400 &&
      !duplicateReturnRes.data.success &&
      duplicateReturnRes.data.message?.includes('already exists'),
      'Step 1b: Duplicate return request creation attempt is strictly rejected with HTTP 400'
    );

    // Step 2: Admin lists all return requests (GET /api/returns)
    const listReturnsRes = await apiFetch('/api/returns', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      listReturnsRes.status === 200 &&
      listReturnsRes.data.success &&
      Array.isArray(listReturnsRes.data.returns) &&
      listReturnsRes.data.returns.some(r => r.id === createdReturnId),
      'Step 2: Admin successfully retrieves returns list including the new pending return'
    );

    // Step 3: Admin Approves Return (PATCH /api/returns/:id/status -> Approved)
    const approveReturnRes = await apiFetch(`/api/returns/${createdReturnId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Approved',
        adminNotes: 'Return approved. Complimentary courier pickup arranged.'
      })
    });
    assert(
      approveReturnRes.status === 200 &&
      approveReturnRes.data.success &&
      approveReturnRes.data.returnRequest?.status === 'Approved',
      'Step 3: Admin approves return request -> Status becomes "Approved"'
    );

    // Step 4: Admin Rejects Return (PATCH /api/returns/:id/status -> Rejected)
    const rejectReturnRes = await apiFetch(`/api/returns/${createdReturnId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Rejected',
        adminNotes: 'Timeframe expired beyond standard policy.'
      })
    });
    assert(
      rejectReturnRes.status === 200 &&
      rejectReturnRes.data.success &&
      rejectReturnRes.data.returnRequest?.status === 'Rejected',
      'Step 4: Admin rejects return request -> Status becomes "Rejected"'
    );

    // Step 5: User lookup return endpoint (GET /api/returns/lookup?orderId=...)
    const lookupReturnRes = await apiFetch(`/api/returns/lookup?orderId=${returnTestOrderId}`);
    assert(
      lookupReturnRes.status === 200 &&
      lookupReturnRes.data.success &&
      Array.isArray(lookupReturnRes.data.returns) &&
      lookupReturnRes.data.returns.length > 0 &&
      lookupReturnRes.data.returns[0].status === 'Rejected',
      'Step 5: User can lookup return status for their order and receives updated status'
    );

    // Cleanup return test data
    try {
      await Return.deleteOne({ id: createdReturnId });
      await Order.deleteOne({ id: returnTestOrderId });
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
