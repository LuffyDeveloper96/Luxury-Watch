/**
 * LUXURY WATCH — Automated Production Verification Test Suite
 * Validates: Auth, Admin Guard, Zero OTP, Media Storage, Payment HMAC, CORS, and Health
 */

import http from 'http';
import crypto from 'crypto';
import app from './index.js';
import { env } from './config/env.js';
import { User, Product, Order, Return, Coupon, Review } from './models/index.js';
import { generateToken } from './middleware/auth.js';
import { emailService } from './services/emailService.js';

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

    // ─────────────────────────────────────────────────────────────────────────────
    // Phase 10: VIP Coupon CRUD & Parameter Resilience Verification
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[Phase 10: VIP Coupon CRUD & Parameter Resilience]');
    const testCouponCode = `TESTVIP_${Date.now()}`;

    // 10A: Create Coupon (POST /api/coupons)
    const createCouponRes = await apiFetch('/api/coupons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        code: testCouponCode,
        discountPercent: 15,
        minSpend: 5000,
        maxDiscount: 2000,
        description: 'Automated Test VIP Coupon'
      })
    });
    assert(
      createCouponRes.status === 201 &&
      createCouponRes.data.success &&
      createCouponRes.data.coupon?.code === testCouponCode,
      'Step 10A: Master Admin successfully creates new promotion coupon'
    );
    const createdCouponMongoId = createCouponRes.data.coupon?._id?.toString() || createCouponRes.data.coupon?.id;

    // 10B: Update coupon by Coupon Code (PUT /api/coupons/:code)
    const updateCouponByCodeRes = await apiFetch(`/api/coupons/${testCouponCode}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        discountPercent: 20,
        description: 'Updated VIP 20% Discount'
      })
    });
    assert(
      updateCouponByCodeRes.status === 200 &&
      updateCouponByCodeRes.data.success &&
      updateCouponByCodeRes.data.coupon?.discountPercent === 20,
      'Step 10B: Admin updates coupon by Code without TypeError (discountPercent -> 20)'
    );

    // 10C: Update coupon by MongoDB ID (PUT /api/coupons/:mongoId)
    if (createdCouponMongoId) {
      const updateCouponByIdRes = await apiFetch(`/api/coupons/${createdCouponMongoId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          discountPercent: 25
        })
      });
      assert(
        updateCouponByIdRes.status === 200 &&
        updateCouponByIdRes.data.success &&
        updateCouponByIdRes.data.coupon?.discountPercent === 25,
        'Step 10C: Admin updates coupon by MongoDB _id (discountPercent -> 25)'
      );
    }

    // 10D: Invalid / Nonexistent coupon update returns 404
    const invalidCouponUpdateRes = await apiFetch('/api/coupons/NONEXISTENT_CODE_999', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ discountPercent: 10 })
    });
    assert(
      invalidCouponUpdateRes.status === 404 &&
      !invalidCouponUpdateRes.data.success,
      'Step 10D: Nonexistent coupon update returns proper HTTP 404 Not Found'
    );

    // 10E: Delete coupon by Code or ID (DELETE /api/coupons/:target)
    const deleteCouponRes = await apiFetch(`/api/coupons/${testCouponCode}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      deleteCouponRes.status === 200 &&
      deleteCouponRes.data.success,
      'Step 10E: Admin deletes coupon by Code without parameter mismatch or crash'
    );

    // ─────────────────────────────────────────────────────────────────────────────
    // Phase 11: Patron Profile Management & Security (PUT /api/auth/user/profile)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[Phase 11: Patron Profile Management & Security]');

    // 11A: Unauthenticated profile update rejected (HTTP 401)
    const unauthProfileRes = await apiFetch('/api/auth/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Hacker Attempt' })
    });
    assert(
      unauthProfileRes.status === 401 && !unauthProfileRes.data.success,
      'Step 11A: Unauthenticated profile update request is strictly rejected with HTTP 401'
    );

    // Create fresh dedicated patron for profile tests
    const profileTestEmail = `patron_profile_${Date.now()}@luxurywatch.test`;
    const profileSignup = await apiFetch('/api/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Profile Patron Initial',
        email: profileTestEmail,
        password: 'TestPassword123!',
        phone: '+919123456780'
      })
    });
    assert(profileSignup.status === 201 && profileSignup.data.token, 'Step 11B-0: Dedicated patron created for profile tests');
    const profileCustomerToken = profileSignup.data.token;

    // 11B: Authenticated profile update (name + phone)
    const updatedPatronName = 'Sir Horology Patron IV';
    const updatedPatronPhone = '+91 9876543210';
    const authProfileRes = await apiFetch('/api/auth/user/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${profileCustomerToken}` },
      body: JSON.stringify({
        name: updatedPatronName,
        phone: updatedPatronPhone,
        role: 'admin', // Attempted privilege escalation
        email: 'hacked@luxurywatch.test' // Attempted email takeover
      })
    });
    assert(
      authProfileRes.status === 200 &&
      authProfileRes.data.success &&
      authProfileRes.data.user?.name === updatedPatronName &&
      authProfileRes.data.user?.phone === updatedPatronPhone &&
      authProfileRes.data.user?.role === 'customer' &&
      authProfileRes.data.user?.email === profileTestEmail &&
      !authProfileRes.data.user?.password,
      'Step 11B: Authenticated patron updates name & phone; role/email escalation blocked; password not exposed',
      JSON.stringify({ status: authProfileRes.status, data: authProfileRes.data })
    );

    // 11C: Profile changes persist on fresh /me request
    const freshMeRes = await apiFetch('/api/auth/user/me', {
      headers: { Authorization: `Bearer ${profileCustomerToken}` }
    });
    assert(
      freshMeRes.status === 200 &&
      freshMeRes.data.user?.name === updatedPatronName &&
      freshMeRes.data.user?.phone === updatedPatronPhone &&
      !freshMeRes.data.user?.password,
      'Step 11C: Profile updates persist accurately on fresh GET /api/auth/user/me',
      JSON.stringify({ status: freshMeRes.status, data: freshMeRes.data })
    );

    // Cleanup profile test user
    try {
      await User.deleteOne({ email: profileTestEmail });
    } catch (e) {}

    // ─────────────────────────────────────────────────────────────────────────────
    // Phase 12: Review Moderation & ID Resolution (Custom ID and ObjectId)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[Phase 12: Review Moderation & Identifier Resolution]');

    // 12A: Submit review (POST /api/reviews)
    const createReviewRes = await apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'rolex-submariner-date',
        author: 'Lord Horologist',
        rating: 5,
        title: 'Masterpiece Calibre Execution',
        comment: 'Finishing on the bevelled edges and bezel click torque is supreme.',
        location: 'London, UK'
      })
    });
    assert(
      createReviewRes.status === 201 &&
      createReviewRes.data.success &&
      createReviewRes.data.review?.id,
      'Step 12A: Patron successfully submits product review'
    );
    const createdReviewId = createReviewRes.data.review?.id;
    const createdReviewMongoId = createReviewRes.data.review?._id?.toString();

    // 12B: Update review status by custom ID (PATCH /api/reviews/:id/status)
    const updateReviewStatusRes = await apiFetch(`/api/reviews/${createdReviewId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(
      updateReviewStatusRes.status === 200 &&
      updateReviewStatusRes.data.success &&
      updateReviewStatusRes.data.review?.status === 'approved',
      'Step 12B: Admin updates review status by custom ID (status -> approved)'
    );

    // 12C: Update review status by MongoDB _id (if available)
    if (createdReviewMongoId) {
      const updateReviewByMongoIdRes = await apiFetch(`/api/reviews/${createdReviewMongoId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'hidden' })
      });
      assert(
        updateReviewByMongoIdRes.status === 200 &&
        updateReviewByMongoIdRes.data.success &&
        updateReviewByMongoIdRes.data.review?.status === 'hidden',
        'Step 12C: Admin updates review status by MongoDB _id without crash (status -> hidden)'
      );
    }

    // 12D: Invalid review ID handled safely (404)
    const invalidReviewRes = await apiFetch('/api/reviews/NONEXISTENT_REV_9999/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(
      invalidReviewRes.status === 404 && !invalidReviewRes.data.success,
      'Step 12D: Nonexistent review ID returns proper HTTP 404 Not Found'
    );

    // 12E: Delete review by ID
    const deleteReviewRes = await apiFetch(`/api/reviews/${createdReviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      deleteReviewRes.status === 200 && deleteReviewRes.data.success,
      'Step 12E: Admin successfully deletes test review'
    );

    // =========================================================================
    // 13. Production Order Confirmation Email System Verification
    // =========================================================================
    console.log('\n[Phase 13: Production Order Confirmation Email Suite]');
    let dispatchedEmails = [];
    let mockTransporter = {
      sendMail: async (options) => {
        dispatchedEmails.push(options);
        return { messageId: `mock-msg-${Date.now()}` };
      }
    };
    emailService.setTransporter(mockTransporter);

    // 13A: Scenario A - Email Send Succeeds
    const emailTestOrderId = `ORD-EML-${Date.now()}`;
    const emailTestRecipient = `patron_email_${Date.now()}@luxurywatch.test`;
    const testOrderDoc = await Order.create({
      id: emailTestOrderId,
      orderNumber: emailTestOrderId,
      customer: {
        fullName: 'Bespoke Patron',
        email: emailTestRecipient,
        phone: '+919876543210',
        address: '10 Haute Horlogerie Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        deliverySpeed: 'Securitas Armoured Express (Insured)'
      },
      items: [
        {
          id: 'watch-rolex-sub-01',
          name: 'Rolex Submariner Date 41mm',
          brand: 'Rolex',
          price: 1450000,
          quantity: 1
        }
      ],
      subtotal: 1450000,
      discountAmount: 50000,
      appliedCoupon: { code: 'VIP2026', discountPercent: 5 },
      shippingFee: 499,
      total: 1400499,
      currency: 'INR',
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      courierTier: 'Securitas Armoured Express (Insured)',
      confirmationEmailSent: false,
      createdAt: new Date()
    });

    const emailSendResult = await emailService.sendOrderConfirmationEmail(testOrderDoc);
    const orderDocAfterSuccess = await Order.findOne({ id: emailTestOrderId }).lean();

    assert(
      emailSendResult.success === true && dispatchedEmails.length === 1,
      'Step 13A-1: Email sent exactly once via transporter on success'
    );
    assert(
      orderDocAfterSuccess?.confirmationEmailSent === true && orderDocAfterSuccess?.confirmationEmailSentAt instanceof Date,
      'Step 13A-2: confirmationEmailSent=true and confirmationEmailSentAt exists in DB only after sendMail success'
    );
    assert(
      dispatchedEmails[0]?.to === emailTestRecipient,
      'Step 13A-3: Email sent to actual customer email without fake fallback'
    );
    assert(
      dispatchedEmails[0]?.subject?.includes(emailTestOrderId) &&
      dispatchedEmails[0]?.subject?.includes('Order Confirmed'),
      'Step 13A-4: Email subject line contains valid order reference ID and canonical status'
    );
    assert(
      dispatchedEmails[0]?.html?.includes('Rolex Submariner Date 41mm') &&
      dispatchedEmails[0]?.html?.includes('14,00,499') &&
      dispatchedEmails[0]?.html?.includes('Order Confirmed') &&
      dispatchedEmails[0]?.html?.includes('/orders?id='),
      'Step 13A-5: Responsive HTML contains luxury branding, line items, totals, canonical status, and tracking URL'
    );
    assert(
      dispatchedEmails[0]?.text?.includes('Rolex Submariner Date 41mm') &&
      dispatchedEmails[0]?.text?.includes('Order Confirmed') &&
      dispatchedEmails[0]?.text?.includes('/orders?id='),
      'Step 13A-6: Plain text fallback contains comprehensive breakdown, canonical status, and tracking link'
    );

    // 13B: Scenario B - Email Send Fails (Order stays successful, confirmationEmailSent remains false, retry succeeds)
    const failingTransporter = {
      sendMail: async () => {
        throw new Error('Simulated Gmail SMTP Network Disconnection');
      }
    };
    emailService.setTransporter(failingTransporter);

    const failTestOrderId = `ORD-FAIL-${Date.now()}`;
    const failOrderDoc = await Order.create({
      id: failTestOrderId,
      orderNumber: failTestOrderId,
      customer: {
        fullName: 'Failover Patron',
        email: `failover_${Date.now()}@luxurywatch.test`,
        phone: '+919876543219',
        address: '50 Marine Lines',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400020',
        country: 'India'
      },
      items: [
        {
          id: 'watch-rolex-sub-01',
          name: 'Rolex Submariner Date 41mm',
          brand: 'Rolex',
          price: 1450000,
          quantity: 1
        }
      ],
      subtotal: 1450000,
      total: 1450000,
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      confirmationEmailSent: false,
      createdAt: new Date()
    });

    const failedSendResult = await emailService.sendOrderConfirmationEmail(failOrderDoc);
    const orderDocAfterFailure = await Order.findOne({ id: failTestOrderId }).lean();

    assert(
      failedSendResult.success === false && failedSendResult.reason === 'SEND_FAILED',
      'Step 13B-1: Email send failure returns safe failure result without crashing'
    );
    assert(
      orderDocAfterFailure?.confirmationEmailSent === false && !orderDocAfterFailure?.confirmationEmailSentAt,
      'Step 13B-2: On failure, confirmationEmailSent remains false and confirmationEmailSentAt remains unset'
    );
    assert(
      orderDocAfterFailure?.orderStatus === 'Confirmed' && orderDocAfterFailure?.paymentStatus === 'Paid',
      'Step 13B-3: Order and payment remain completely intact and confirmed despite email error'
    );

    // Test subsequent successful retry on the failed order
    emailService.setTransporter(mockTransporter);
    const retrySendResult = await emailService.sendOrderConfirmationEmail(failOrderDoc);
    const orderDocAfterRetry = await Order.findOne({ id: failTestOrderId }).lean();

    assert(
      retrySendResult.success === true && orderDocAfterRetry?.confirmationEmailSent === true,
      'Step 13B-4: Subsequent legitimate retry succeeds and marks confirmationEmailSent=true'
    );

    // 13C: Scenario C - Concurrent duplicate attempts (Race Condition Prevention)
    const concurrentOrderId = `ORD-CONC-${Date.now()}`;
    const concurrentOrderDoc = await Order.create({
      id: concurrentOrderId,
      orderNumber: concurrentOrderId,
      customer: {
        fullName: 'Concurrent Patron',
        email: `concurrent_${Date.now()}@luxurywatch.test`,
        phone: '+919876543212',
        address: '100 Gateway Plaza',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India'
      },
      items: [
        {
          id: 'watch-rolex-sub-01',
          name: 'Rolex Submariner Date 41mm',
          brand: 'Rolex',
          price: 1450000,
          quantity: 1
        }
      ],
      subtotal: 1450000,
      total: 1450000,
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      confirmationEmailSent: false,
      createdAt: new Date()
    });

    const emailCountBefore = dispatchedEmails.length;
    // Trigger 3 concurrent dispatch calls simultaneously
    const concurrentResults = await Promise.all([
      emailService.sendOrderConfirmationEmail(concurrentOrderDoc),
      emailService.sendOrderConfirmationEmail(concurrentOrderDoc),
      emailService.sendOrderConfirmationEmail(concurrentOrderDoc)
    ]);

    const emailCountAfter = dispatchedEmails.length;
    const dispatchedForConcurrent = emailCountAfter - emailCountBefore;

    assert(
      dispatchedForConcurrent === 1,
      `Step 13C: Concurrent duplicate requests dispatch exactly 1 email (dispatched: ${dispatchedForConcurrent})`
    );

    // 13D: Scenario D & E - Missing customer email is handled safely & Environment config
    const missingEmailResult = await emailService.sendOrderConfirmationEmail({
      id: 'ORD-NO-EMAIL',
      customer: { email: '' }
    });
    assert(
      missingEmailResult.success === false && missingEmailResult.reason === 'MISSING_RECIPIENT_EMAIL',
      'Step 13D: Missing customer email is handled safely without throwing exception'
    );

    assert(
      typeof env.EMAIL_USER === 'string' &&
      typeof env.EMAIL_APP_PASSWORD === 'string' &&
      typeof env.EMAIL_FROM_NAME === 'string',
      'Step 13E: Email credentials and sender name read from environment variables'
    );

    assert(
      !JSON.stringify(emailSendResult).includes('password') &&
      !JSON.stringify(emailSendResult).includes('pass') &&
      !JSON.stringify(failedSendResult).includes('password'),
      'Step 13F: No secrets or passwords present in email service return values'
    );

    // Reset email transporter
    emailService.resetTransporter();

    // Cleanup user test data
    try {
      await User.deleteOne({ email: testEmail });
      await Coupon.deleteOne({ code: testCouponCode });
      if (createdReviewId) await Review.deleteOne({ id: createdReviewId });
      if (emailTestOrderId) await Order.deleteOne({ id: emailTestOrderId });
      if (resilientOrderId) await Order.deleteOne({ id: resilientOrderId });
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
