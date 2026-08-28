import assert from 'assert';
import mongoose from 'mongoose';
import './index.js';
import { env } from './config/env.js';
import { connectMongoDB } from './config/db.js';
import { getDevOtpSession } from './services/otpService.js';
import {
  User,
  Product,
  Brand,
  Category,
  Order,
  Cart,
  Coupon,
  Review,
  Payment,
  StoreSettings,
  HomepageContent,
  Return,
  ActivityLog,
  Contact
} from './models/index.js';

const BASE_URL = `http://127.0.0.1:${env.PORT || 5000}/api`;

async function testRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runMongodbIntegrationSuite() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   LUXURY WATCH — MONGODB PRODUCTION INTEGRATION TEST SUITE    ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Ensure connection is fully established
  while (mongoose.connection.readyState !== 1) {
    await new Promise(r => setTimeout(r, 300));
  }

  let passed = 0;
  let failed = 0;

  const assertTest = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${details ? '— ' + details : ''}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? '— ' + details : ''}`);
      failed++;
    }
  };

  try {
    // 1. Verify Database Connection
    console.log('--- 1. MONGODB ATLAS / CLUSTER PERSISTENCE LAYER ---');
    assertTest(mongoose.connection.readyState === 1, 'MongoDB Connection Active', `Database: ${mongoose.connection.name}`);

    // 2. Master Admin Authentication
    console.log('\n--- 2. MASTER ADMIN AUTHENTICATION (ENVIRONMENT-LOCKED) ---');
    const adminLoginRes = await testRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: 'LuxuryWatch2026!'
      })
    });
    assertTest(adminLoginRes.ok && adminLoginRes.data.token, 'Master Administrator Authentication', `Email: ${env.ADMIN_EMAIL}`);
    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. User Signup, OTP Verification, and MongoDB Document Creation
    console.log('\n--- 3. USER AUTHENTICATION & PROFILE PERSISTENCE (MONGODB) ---');
    const timestamp = Date.now();
    const testEmail = `patron.${timestamp}@luxurywatch.com`;
    const testPassword = 'PatronPassword2026!';

    const signupInitRes = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lord Horologist',
        email: testEmail,
        password: testPassword,
        phone: '+91 98200 98200'
      })
    });
    assertTest(signupInitRes.ok && signupInitRes.data.step === 'otp', 'Initiate Patron Sign Up -> Dispatches OTP');

    const signupOtp = getDevOtpSession(testEmail)?.rawOtp;
    assertTest(Boolean(signupOtp), 'Retrieve Verification OTP Session');

    const signupVerifyRes = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: signupOtp })
    });
    assertTest(signupVerifyRes.ok && signupVerifyRes.data.token, 'Verify 6-Digit OTP & Register User in MongoDB');
    const userToken = signupVerifyRes.data.token;
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    // Verify User persisted in MongoDB directly
    const userInDb = await User.findOne({ email: testEmail }).lean();
    assertTest(Boolean(userInDb && userInDb.verified), 'Direct DB Check: User document persisted in MongoDB');

    // 4. Patron Profile & Address Management (Atomic MongoDB Operations)
    console.log('\n--- 4. ADDRESSES & PATRON PROFILE (ATOMIC MONGODB CRUD) ---');
    const profileRes = await testRequest('/auth/user/me', { headers: userHeaders });
    assertTest(profileRes.ok && profileRes.data.user?.email === testEmail, 'Retrieve Authenticated Patron Profile (/api/auth/user/me)');

    const addAddressRes = await testRequest('/auth/user/addresses', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        fullName: 'Lord Horologist of Geneva',
        phone: '+91 98200 98200',
        street: 'The Capital, G Block, BKC',
        landmark: 'Near Sofitel Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        country: 'India',
        isDefault: true
      })
    });
    assertTest(addAddressRes.ok && addAddressRes.data.address?.id, 'Add Shipping Address atomically ($push in MongoDB)');
    const addressId = addAddressRes.data.address?.id;

    // Delete address
    const deleteAddressRes = await testRequest(`/auth/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: userHeaders
    });
    assertTest(deleteAddressRes.ok, 'Delete Shipping Address atomically ($pull in MongoDB)');

    // 5. Products Catalog, Filtering, Search Suggestions & Admin CRUD
    console.log('\n--- 5. PRODUCT CATALOG ENGINE (MONGODB QUERIES & INDEXES) ---');
    const productsRes = await testRequest('/products');
    assertTest(productsRes.ok && productsRes.data.products?.length > 0, 'Fetch Products Catalog', `Count: ${productsRes.data.count}`);

    const searchSuggestionsRes = await testRequest('/products/search/suggestions?q=rolex');
    assertTest(searchSuggestionsRes.ok && Array.isArray(searchSuggestionsRes.data.suggestions), 'Search Suggestions Endpoint');

    const firstProduct = productsRes.data.products.find(p => p.stock > 0) || productsRes.data.products[0];
    const productLookupRes = await testRequest(`/products/${firstProduct.slug || firstProduct.id}`);
    assertTest(productLookupRes.ok && productLookupRes.data.product?.name, `Lookup Product by ID/Slug: "${firstProduct.name}"`);

    // Admin Create Product
    const testProductSku = `TEST-SKU-${timestamp}`;
    const createProductRes = await testRequest('/products', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'A. Lange & Söhne Zeitwerk Minute Repeater',
        brand: 'A. Lange & Söhne',
        category: 'Grand Complications',
        gender: 'Men',
        sku: testProductSku,
        price: 8500000,
        stock: 4,
        description: 'The world first mechanical wristwatch with a decimal strike.'
      })
    });
    assertTest(createProductRes.ok && createProductRes.data.product?.sku === testProductSku, 'Admin Create Product in MongoDB');
    const createdProductId = createProductRes.data.product?.id;

    // Atomic Stock Update
    const updateStockRes = await testRequest(`/products/${createdProductId}/stock`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ delta: 2 })
    });
    assertTest(updateStockRes.ok && updateStockRes.data.stock === 6, 'Admin Atomic Stock Update (+2 stock)');

    // Admin Delete Product
    const deleteProductRes = await testRequest(`/products/${createdProductId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assertTest(deleteProductRes.ok, 'Admin Delete Product from MongoDB');

    // 6. Persistent Shopping Cart API (MongoDB)
    console.log('\n--- 6. SHOPPING CART PERSISTENCE (MONGODB ATOMIC OPS) ---');
    const addToCartRes = await testRequest('/cart', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        productId: firstProduct.id,
        quantity: 2
      })
    });
    assertTest(addToCartRes.ok, 'Add Item to Cart in MongoDB');

    const getCartRes = await testRequest('/cart', { headers: userHeaders });
    assertTest(getCartRes.ok && getCartRes.data.cart?.items?.length > 0, 'Fetch Patron Cart from MongoDB (Server-side Price Calculation)');

    const clearCartRes = await testRequest('/cart', {
      method: 'DELETE',
      headers: userHeaders
    });
    assertTest(clearCartRes.ok, 'Clear Patron Cart in MongoDB');

    // 7. VIP Coupons Validation
    console.log('\n--- 7. VIP COUPONS ENGINE (MONGODB) ---');
    const couponValidateRes = await testRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({
        code: 'LUXE10',
        subtotal: 50000
      })
    });
    assertTest(couponValidateRes.ok && couponValidateRes.data.discountAmount > 0, 'Validate VIP Coupon against MongoDB (LUXE10)');

    // 8. Orders Creation with Snapshot Preservation & Atomic Stock Decrement
    console.log('\n--- 8. ORDER BOOKING & HISTORICAL PRICING SNAPSHOTS ---');
    const stockBefore = firstProduct.stock;

    const createOrderRes = await testRequest('/orders', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        customer: {
          fullName: 'Lord Horologist',
          email: testEmail,
          phone: '+91 98200 98200',
          address: 'Level 12, The Capital, BKC',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          country: 'India'
        },
        items: [{
          id: firstProduct.id,
          quantity: 1
        }],
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed'
      })
    });
    assertTest(createOrderRes.ok && createOrderRes.data.order?.id, 'Admin Create Order with Server-Calculated Price Snapshot');
    const createdOrderId = createOrderRes.data.order?.id;

    // Direct check on stock decrement in MongoDB
    const prodAfter = await Product.findOne({ id: firstProduct.id }).lean();
    assertTest(prodAfter.stock === stockBefore - 1, 'Atomic Stock Decrement on Order Creation in MongoDB');

    // Order cancellation & stock restoration
    const cancelOrderRes = await testRequest(`/orders/${createdOrderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Test order cancellation' })
    });
    assertTest(cancelOrderRes.ok && cancelOrderRes.data.order?.orderStatus === 'Cancelled', 'Cancel Order & Atomically Restore Stock');

    const prodRestored = await Product.findOne({ id: firstProduct.id }).lean();
    assertTest(prodRestored.stock === stockBefore, 'Atomic Stock Restoration on Order Cancellation');

    // 9. Customer Reviews & Average Rating Recalculation
    console.log('\n--- 9. CUSTOMER REVIEWS & ATOMIC RATING RECALCULATION ---');
    const createReviewRes = await testRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        productId: firstProduct.id,
        author: 'Baron von Horology',
        rating: 5,
        title: 'Masterpiece of Haute Horlogerie',
        comment: 'Exceptional precision and breathtaking finishing.'
      })
    });
    assertTest(createReviewRes.ok && createReviewRes.data.review?.id, 'Create Product Review in MongoDB');
    const reviewId = createReviewRes.data.review?.id;

    // Delete review
    const deleteReviewRes = await testRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assertTest(deleteReviewRes.ok, 'Admin Delete Review from MongoDB');

    // 10. Concierge Returns & Inquiries
    console.log('\n--- 10. CONCIERGE RETURNS & INQUIRIES (MONGODB) ---');
    const createReturnRes = await testRequest('/returns', {
      method: 'POST',
      body: JSON.stringify({
        orderId: 'ORD-LW-41969',
        customerName: 'Valued Patron',
        customerEmail: testEmail,
        returnReason: 'Case size adjustment required'
      })
    });
    assertTest(createReturnRes.ok && createReturnRes.data.request?.id, 'Submit Concierge Return Request');

    const contactRes = await testRequest('/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lord Horologist',
        email: testEmail,
        subject: 'Bespoke Chronometer Allocation',
        message: 'Inquiring regarding private tourbillon allocation.'
      })
    });
    assertTest(contactRes.ok && contactRes.data.entry?.id, 'Submit Concierge Contact Inquiry');

    // 11. Store & Payment Settings Persistence
    console.log('\n--- 11. STORE & PAYMENT SETTINGS PERSISTENCE ---');
    const storeSettingsRes = await testRequest('/settings/store');
    assertTest(storeSettingsRes.ok && storeSettingsRes.data.settings?.currency === 'INR', 'Fetch Store Settings from MongoDB');

    const updateStoreSettingsRes = await testRequest('/settings/store', {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        freeShippingThreshold: 999,
        expressShippingFee: 499
      })
    });
    assertTest(updateStoreSettingsRes.ok, 'Update Store Settings in MongoDB');

    // 12. Analytics Summary KPIs
    console.log('\n--- 12. ANALYTICS & FINANCIAL KPIS (MONGODB AGGREGATION) ---');
    const analyticsRes = await testRequest('/analytics/summary', { headers: adminHeaders });
    assertTest(analyticsRes.ok && analyticsRes.data.metrics?.totalRevenue !== undefined, 'Compute Financial Metrics from MongoDB Collections');

  } catch (err) {
    console.error('Fatal Integration Test Error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`📊 INTEGRATION SUITE RESULT: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMongodbIntegrationSuite().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
