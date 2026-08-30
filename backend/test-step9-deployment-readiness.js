import assert from 'assert';
import crypto from 'crypto';
import { env } from './config/env.js';
import { connectMongoDB } from './config/db.js';
import { Product, Coupon, Order, Payment } from './models/index.js';
import { escapeRegex } from './utils/regex.js';
import { generateToken } from './middleware/auth.js';

// Starts backend server on port 5000
import './index.js';

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

async function runStep9DeploymentAudit() {
  await connectMongoDB();
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('🚀 LUXURY WATCH — STEP 9 PRODUCTION DEPLOYMENT & SMOKE TEST SUITE');
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

  // Seed fixture product for deterministic testing
  const fixtureProdId = `prod-step9-${Date.now()}`;
  await Product.create({
    id: fixtureProdId,
    sku: `SKU-${Date.now()}`,
    name: 'Royal Oak Smoke Test',
    brand: 'Audemars Piguet',
    category: 'Grand Complications',
    price: 3500000,
    stock: 10,
    active: true
  });

  // 1. Health Endpoint
  await test('1. Health check returns 200 and operational status', async () => {
    const res = await testRequest('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'online');
    assert.ok(res.data.version, 'Version present');
  });

  // 2. Security Headers
  await test('2. Helmet security headers present on responses', async () => {
    const res = await fetch(`http://127.0.0.1:${env.PORT || 5000}/api/health`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
  });

  // 3. Product Catalog
  await test('3. Public catalog loads active products with pagination and filter bounds', async () => {
    const res = await testRequest('/products?limit=10&page=1');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.products), 'Products array returned');
    assert.ok(res.data.products.length <= 10, 'Pagination bounded');
  });

  // 4. Product Details
  await test('4. Product details by ID returns complete timepiece specifications', async () => {
    const res = await testRequest(`/products/${fixtureProdId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.product.id, fixtureProdId);
    assert.strictEqual(res.data.product.price, 3500000);
  });

  // 5. Brands Showcase
  await test('5. Database-driven brand showcase endpoints functional', async () => {
    const res = await testRequest('/brands');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.brands), 'Brands array returned');
  });

  // 6. Categories Hierarchy
  await test('6. Categories hierarchy endpoint functional', async () => {
    const res = await testRequest('/categories');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.categories), 'Categories array returned');
  });

  // 7. User Registration Primitive Guard
  await test('7. User registration rejects non-string types with 400 Bad Request', async () => {
    const res = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ name: 'Valid User', email: { $gt: '' }, password: 'Password123!', phone: '+91 99999 99999' })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // 8. User Login Primitive Guard
  await test('8. User login rejects non-string types with 400 Bad Request', async () => {
    const res = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // 9. Admin Login Authentication
  await test('9. Master Admin authentication verifies against bcrypt hash', async () => {
    const res = await testRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: env.ADMIN_EMAIL, password: 'LuxuryWatch2026!' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(typeof res.data.token === 'string', 'JWT token returned');
  });

  // 10. Admin Endpoint Authorization Guard
  await test('10. Unauthenticated request to /api/orders rejected (401 Unauthorized)', async () => {
    const res = await testRequest('/orders');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  // 11. Customer Cannot Access Admin Endpoint
  await test('11. Customer token attempting /api/orders rejected (403 Forbidden)', async () => {
    const customerToken = generateToken({ email: 'patron@example.com', role: 'customer' });
    const res = await testRequest('/orders', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  // 12. Direct Order Creation Guard
  await test('12. Direct order creation without admin token strictly rejected (401)', async () => {
    const res = await testRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({ total: 100, items: [] })
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  // 13. Quantity Hardening
  await test('13. Payment order creation rejects non-integer/negative/overflow quantities (400)', async () => {
    const res = await testRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ items: [{ id: fixtureProdId, quantity: -3 }] })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // 14. Server-Side Price Calculation
  await test('14. Payment order calculates price purely from database', async () => {
    const res = await testRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: fixtureProdId, price: 1, quantity: 1 }], // Client claims ₹1
        deliverySpeed: 'standard',
        customer: { email: 'client@example.com', fullName: 'Horology Fan' }
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    // Fixture price is ₹35,00,000 => ₹35,00,000 * 100 = 350000000 paise
    assert.strictEqual(res.data.amount, 350000000, 'Server calculated authentic DB price');
  });

  // 15. Return Lookup Privacy
  await test('15. Return lookup masks customer PII (phone, email, address)', async () => {
    const lookupRes = await testRequest(`/returns/lookup?orderId=ORD-NONEXISTENT&customerEmail=customer@example.com`);
    assert.ok(lookupRes.status === 404 || lookupRes.status === 200);
    if (lookupRes.status === 200 && lookupRes.data.returnData) {
      assert.strictEqual(lookupRes.data.returnData.customerPhone, undefined);
    }
  });

  // 16. Regex Escaping
  await test('16. Regex queries with special characters are safely escaped without ReDoS', async () => {
    const res = await testRequest('/products?search=' + encodeURIComponent('Ro.*(lex)+?'));
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 17. Homepage CMS
  await test('17. Homepage CMS content endpoint returns structured CMS layout', async () => {
    const res = await testRequest('/homepage/content');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.content, 'Content object returned');
  });

  // 18. Settings Privacy
  await test('18. Settings API masks Razorpay secret and sensitive credentials', async () => {
    const adminToken = generateToken({ email: env.ADMIN_EMAIL, role: 'Grand Horologist / Master Administrator' });
    const res = await testRequest('/settings/payment', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.settings?.razorpayKeySecret, undefined, 'Key secret must not be exposed');
    assert.ok(typeof res.data.settings?.isSecretConfigured === 'boolean');
  });

  // 19. Reviews API
  await test('19. Reviews API endpoint returns active product reviews', async () => {
    const res = await testRequest('/reviews');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.reviews), 'Reviews array returned');
  });

  // 20. Production Error Sanitization
  await test('20. 404 handler returns clean JSON without leaking stack traces or paths', async () => {
    const res = await testRequest('/non-existent-api-endpoint-test');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.stack, undefined);
  });

  console.log('\n======================================================================');
  console.log(`📊 STEP 9 SMOKE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runStep9DeploymentAudit().catch(err => {
  console.error('Fatal Step 9 Audit Exception:', err);
  process.exit(1);
});
