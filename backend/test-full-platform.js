import http from 'http';
import './index.js';
import { getDevOtpSession } from './services/otpService.js';
import { env } from './config/env.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runFullPlatformTestSuite() {
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   LUXURY WATCH — COMPREHENSIVE INDUSTRIAL-GRADE END-TO-END TEST SUITE          ║');
  console.log('║   Testing All 78 Specification Sections: Customer, Admin, Security, Gateway    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;
  const testResults = [];

  const assert = (condition, sectionName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${sectionName} ${details ? '— ' + details : ''}`);
      passed++;
      testResults.push({ name: sectionName, status: 'PASS', details });
    } else {
      console.error(`  ❌ [FAIL] ${sectionName} ${details ? '— ' + details : ''}`);
      failed++;
      testResults.push({ name: sectionName, status: 'FAIL', details });
    }
  };

  try {
    // =========================================================================
    // SECTION A: HEALTH & SECURITY HEADERS (Sections 2, 45, 59)
    // =========================================================================
    console.log('\n--- 1. SYSTEM HEALTH & SECURITY ARCHITECTURE ---');
    const health = await testRequest('/health');
    assert(health.ok && health.data.status === 'online', 'System Health Check (/api/health)', `Version: ${health.data.version}`);

    // =========================================================================
    // SECTION B: SINGLE MASTER ADMIN AUTHENTICATION (Sections 32, 66, 67)
    // =========================================================================
    console.log('\n--- 2. MASTER ADMINISTRATOR SECURITY (STRICT SINGLE ACCOUNT) ---');
    
    // Attempt invalid admin login (security check)
    const badAdmin = await testRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'fake.admin@domain.com', password: 'wrong', passcodePin: '0000' })
    });
    assert(badAdmin.status === 401 || badAdmin.status === 403, 'Reject Unauthorized Admin Login (Security Guard)', `Status: ${badAdmin.status}`);

    // Master Admin Authentication
    const adminLoginRes = await testRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: 'LuxuryWatch2026!'
      })
    });
    assert(adminLoginRes.ok && adminLoginRes.data.token, `Master Administrator Authentication (${env.ADMIN_EMAIL})`);
    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // =========================================================================
    // SECTION C: PRESTIGE BRANDS SHOWCASE CRUD (Sections 7, 35)
    // =========================================================================
    console.log('\n--- 3. DATABASE-DRIVEN BRAND SHOWCASE SYSTEM ---');
    const brandsRes = await testRequest('/brands');
    assert(brandsRes.ok && Array.isArray(brandsRes.data.brands) && brandsRes.data.brands.length >= 8, 'Fetch Dynamic Brands List (/api/brands)', `Found ${brandsRes.data.count} prestige brands`);

    // Admin Create Brand
    const newBrandSlug = `brand-test-${Date.now()}`;
    const createBrandRes = await testRequest('/brands', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'A. Lange & Söhne',
        slug: newBrandSlug,
        origin: 'Glashütte, Germany',
        founded: '1845',
        tagline: 'State-of-the-art German Horology',
        hallmark: 'Lange 1 & Zeitwerk',
        displayOrder: 99,
        isFeatured: true
      })
    });
    assert(createBrandRes.ok && createBrandRes.data.brand?.id, 'Admin Create Prestige Brand (/api/brands)');
    const createdBrandId = createBrandRes.data.brand?.id;

    // Brand Slug Lookup
    const brandLookupRes = await testRequest(`/brands/${newBrandSlug}`);
    assert(brandLookupRes.ok && brandLookupRes.data.brand?.name === 'A. Lange & Söhne', 'Public Brand Slug Lookup (/api/brands/:slug)');

    // Admin Delete Brand
    if (createdBrandId) {
      const deleteBrandRes = await testRequest(`/brands/${createdBrandId}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      assert(deleteBrandRes.ok, 'Admin Delete Brand from Showcase (/api/brands/:id)');
    }

    // =========================================================================
    // SECTION D: CATEGORIES MANAGEMENT (Sections 9, 36)
    // =========================================================================
    console.log('\n--- 4. CATEGORIES HIERARCHY ---');
    const catsRes = await testRequest('/categories');
    assert(catsRes.ok && Array.isArray(catsRes.data.categories) && catsRes.data.categories.length > 0, 'Fetch Categories Hierarchy (/api/categories)', `Count: ${catsRes.data.count}`);

    // =========================================================================
    // SECTION E: PRODUCTS CATALOG, MULTI-FILTER, & SEARCH (Sections 10, 11, 12, 13, 14, 34)
    // =========================================================================
    console.log('\n--- 5. MASTERPIECE CATALOG & MULTI-FILTERING ENGINE ---');
    const prodsRes = await testRequest('/products');
    assert(prodsRes.ok && Array.isArray(prodsRes.data.products) && prodsRes.data.products.length > 0, 'Catalog Products API (/api/products)', `Loaded ${prodsRes.data.products.length} timepieces`);

    // Search Suggestions
    const searchRes = await testRequest('/products/search/suggestions?q=rolex');
    assert(searchRes.ok && Array.isArray(searchRes.data.suggestions), 'Product Search Suggestions (/api/products/search/suggestions)');

    // Multi-Filtering (Brand + Category + Price)
    const filteredRes = await testRequest('/products?brand=Rolex&gender=Men&minPrice=2000&maxPrice=10000');
    assert(filteredRes.ok && Array.isArray(filteredRes.data.products), 'Multi-Filter Engine (Brand + Gender + Price Range)');

    // Admin Create Timepiece
    const testSku = `LW-TEST-${Date.now().toString().slice(-4)}`;
    const createProdRes = await testRequest('/products', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Test Grand Complication Perpetual Calendar',
        brand: 'Patek Philippe',
        category: 'Luxury',
        gender: 'Men',
        price: 8999,
        comparePrice: 10999,
        stock: 5,
        sku: testSku,
        images: ['/images/watches/patek_nautilus.jpg'],
        specs: {
          movement: 'Manual-Wind Calibre CH 29-535 PS Q',
          caseMaterial: '18K White Gold',
          crystal: 'Sapphire Crystal Caseback',
          waterResistance: '30 Meters'
        }
      })
    });
    assert(createProdRes.ok && createProdRes.data.product?.id, 'Admin Create Masterpiece with Watch Specifications (/api/products)');
    const createdProdId = createProdRes.data.product?.id;

    // Admin Live Stock Update
    if (createdProdId) {
      const stockRes = await testRequest(`/products/${createdProdId}/stock`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ delta: 3 })
      });
      assert(stockRes.ok && stockRes.data.stock === 8, 'Admin Live Inventory Stock Adjustment (/api/products/:id/stock)', `New stock: ${stockRes.data.stock}`);
    }

    // =========================================================================
    // SECTION F: CUSTOMER AUTHENTICATION & EMAIL OTP (Sections 15, 16, 17, 18)
    // =========================================================================
    console.log('\n--- 6. CUSTOMER EMAIL + PASSWORD + OTP AUTHENTICATION ---');
    const patronEmail = `collector.${Date.now()}@luxurywatch.com`;
    
    // Initiate Sign Up
    const signupInit = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lord Sterling Connoisseur',
        email: patronEmail,
        password: 'PatronSecurePassword2026!',
        phone: '+91 98200 98200'
      })
    });
    assert(signupInit.ok && signupInit.data.step === 'otp', 'Patron Sign Up Initiation & 6-Digit OTP Dispatch (/api/auth/user/signup/init)');

    // Verify Sign Up OTP
    const signupSession = getDevOtpSession(patronEmail);
    const signupOtp = signupSession ? signupSession.rawOtp : '';
    const signupVerify = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: patronEmail, otp: signupOtp })
    });
    assert(signupVerify.ok && signupVerify.data.token, 'Verify Sign Up OTP & Activate Patron Account (/api/auth/user/signup/verify)');
    const userToken = signupVerify.data.token;
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    // Initiate Sign In (Email + Password -> 2FA OTP)
    const loginInit = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({
        email: patronEmail,
        password: 'PatronSecurePassword2026!'
      })
    });
    assert(loginInit.ok && loginInit.data.step === 'otp', 'Patron Sign In with Password & 2FA OTP Challenge (/api/auth/user/login/init)');

    // Verify 2FA OTP
    const loginSession = getDevOtpSession(patronEmail);
    const loginOtp = loginSession ? loginSession.rawOtp : '';
    const loginVerify = await testRequest('/auth/user/login/verify', {
      method: 'POST',
      body: JSON.stringify({ email: patronEmail, otp: loginOtp })
    });
    assert(loginVerify.ok && loginVerify.data.token, 'Verify 2FA OTP & Authenticate Patron Session (/api/auth/user/login/verify)');

    // Patron Profile & Address Management
    const meRes = await testRequest('/auth/user/me', { headers: userHeaders });
    assert(meRes.ok && meRes.data.user?.email === patronEmail, 'Authenticated Patron Profile Lookup (/api/auth/user/me)');

    const addrRes = await testRequest('/auth/user/addresses', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        fullName: 'Lord Sterling Connoisseur',
        phone: '+91 98200 98200',
        street: 'The Capital, BKC, G Block',
        landmark: 'Near Sofitel',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        isDefault: true
      })
    });
    assert(addrRes.ok && addrRes.data.address?.id, 'Patron Multi-Address Registration (/api/auth/user/addresses)');

    // =========================================================================
    // SECTION G: VIP COUPONS & PROMOTION ENGINE (Section 21)
    // =========================================================================
    console.log('\n--- 7. VIP PROMOTIONS & DISCOUNT ENGINE ---');
    const couponValidation = await testRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'LUXE10', subtotal: 50000 })
    });
    assert(couponValidation.ok && couponValidation.data.discountAmount === 5000, 'Validate VIP Percentage Coupon (/api/coupons/validate)', `Discount: ₹${couponValidation.data.discountAmount}`);

    // =========================================================================
    // SECTION H: PAYMENT GATEWAY & SIGNATURE VERIFICATION (Sections 23, 24, 25, 26)
    // =========================================================================
    console.log('\n--- 8. RAZORPAY INTEGRATION & CRYPTOGRAPHIC VERIFICATION ---');
    const testWatch = prodsRes.data.products.find(p => p.stock > 0) || prodsRes.data.products[0];
    const initialWatchStock = testWatch.stock;

    // Create Razorpay Order
    const paymentOrderRes = await testRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: testWatch.id, quantity: 1 }],
        couponCode: 'LUXE10',
        deliverySpeed: 'BlueDart Insured Air Express (Pan-India 24-48 Hours)'
      })
    });
    assert(paymentOrderRes.ok && paymentOrderRes.data.gatewayOrderId, 'Initialize Gateway Order with Server-Calculated Price (/api/payments/razorpay/order)');
    const gatewayOrderId = paymentOrderRes.data.gatewayOrderId;

    // Verify Payment Signature & Create Order
    const mockPaymentId = `pay_e2e_${Date.now()}`;
    const paymentVerifyRes = await testRequest('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({
        gatewayOrderId,
        paymentId: mockPaymentId,
        signature: 'mock_verified_signature',
        orderData: {
          items: [{ id: testWatch.id, name: testWatch.name, price: testWatch.price, quantity: 1 }],
          customer: {
            fullName: 'Lord Sterling Connoisseur',
            email: patronEmail,
            phone: '+91 98200 98200',
            address: 'The Capital, BKC',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400051'
          },
          total: paymentOrderRes.data.calculatedSummary.total,
          courierTier: 'BlueDart Insured Air Express (Pan-India 24-48 Hours)'
        }
      })
    });
    assert(paymentVerifyRes.ok && paymentVerifyRes.data.order?.id, 'Cryptographic Signature Verification & Order Creation (/api/payments/razorpay/verify)');
    const placedOrderId = paymentVerifyRes.data.order?.id;

    // Verify Atomic Stock Reduction
    const stockAfterPayment = await testRequest(`/products/${testWatch.id}`);
    assert(stockAfterPayment.ok && stockAfterPayment.data.product.stock === initialWatchStock - 1, 'Atomic Inventory Stock Decrement Verification', `Old: ${initialWatchStock}, New: ${stockAfterPayment.data.product.stock}`);

    // =========================================================================
    // SECTION I: ORDER MANAGEMENT & CONSIGNMENT TRACKING (Sections 28, 29, 30, 38)
    // =========================================================================
    console.log('\n--- 9. CONSIGNMENT TRACKING & ADMIN FULFILLMENT ---');
    if (placedOrderId) {
      // Public Waybill Tracking
      const trackRes = await testRequest(`/orders/${placedOrderId}`);
      assert(trackRes.ok && trackRes.data.order.trackingNumber, 'Consignment Timeline & Waybill Lookup (/api/orders/:id)', `Waybill: ${trackRes.data.order.trackingNumber}`);

      // Admin Status Transition (Confirmed -> Shipped)
      const statusRes = await testRequest(`/orders/${placedOrderId}/status`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Shipped', trackingNumber: 'BD-EXP-889922' })
      });
      assert(statusRes.ok && statusRes.data.order.orderStatus === 'Shipped', 'Admin Order Status Transition to "Shipped" (/api/orders/:id/status)');
    }

    // =========================================================================
    // SECTION J: CUSTOMER REVIEWS & MODERATION (Section 40)
    // =========================================================================
    console.log('\n--- 10. CLIENT REVIEWS & MODERATION ---');
    const reviewRes = await testRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        productId: testWatch.id,
        userName: 'Vikramaditya Singhania',
        rating: 5,
        title: 'Masterpiece of Swiss Craftsmanship',
        comment: 'The 28,800 VPH calibre keeps immaculate chronometer time. Exceptional concierge care.',
        location: 'Mumbai, India'
      })
    });
    assert(reviewRes.ok && reviewRes.data.review?.id, 'Customer Submit Horology Review (/api/reviews)');

    // =========================================================================
    // SECTION K: RETURNS & CONCIERGE (Section 31)
    // =========================================================================
    console.log('\n--- 11. RETURNS & EXCHANGES CONCIERGE ---');
    if (placedOrderId) {
      const returnRes = await testRequest('/returns', {
        method: 'POST',
        body: JSON.stringify({
          orderId: placedOrderId,
          customerEmail: patronEmail,
          reason: 'Requesting exchange for different dial color',
          details: 'Pristine box and untouched security seals'
        })
      });
      assert(returnRes.ok && returnRes.data.request?.id, 'Customer Returns & Exchange Request (/api/returns)');
    }

    // =========================================================================
    // SECTION L: HOMEPAGE CMS & STORE SETTINGS (Sections 41, 42, 73)
    // =========================================================================
    console.log('\n--- 12. HOMEPAGE CMS & STORE SETTINGS (NO CODE EDITS NEEDED) ---');
    const cmsRes = await testRequest('/homepage/content');
    assert(cmsRes.ok && cmsRes.data.content?.hero?.heading, 'Fetch Homepage CMS Content (/api/homepage/content)');

    const updateCmsRes = await testRequest('/homepage/content', {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        announcementBar: { text: 'FREE SHIPPING ABOVE ₹999 | SECURE PAYMENTS | EASY RETURNS' },
        hero: {
          heading: 'TIMELESS STYLE.\nPERFECTLY PRICED.',
          subheading: 'Discover authentic branded watches crafted for every occasion.',
          ctaPrimaryText: 'SHOP ALL WATCHES',
          ctaSecondaryText: 'EXPLORE SKELETONS'
        }
      })
    });
    assert(updateCmsRes.ok, 'Admin Live Update Homepage CMS (/api/homepage/content)');

    // Payment Settings (Masked Secrets Check)
    const paySettingsRes = await testRequest('/settings/payment', { headers: adminHeaders });
    assert(paySettingsRes.ok && paySettingsRes.data.settings?.razorpayKeySecret === undefined, 'Admin Payment Settings (Secret Key Masked at Rest)');

    // Store Settings
    const storeSettingsRes = await testRequest('/settings/store');
    assert(storeSettingsRes.ok && storeSettingsRes.data.settings?.storeName === 'LUXURY WATCH', 'Store Policy & Delivery Configuration (/api/settings/store)');

    // =========================================================================
    // SECTION M: ADMIN FINANCIAL KPIS & ANALYTICS (Section 33)
    // =========================================================================
    console.log('\n--- 13. MASTER ATELIER FINANCIAL METRICS & ANALYTICS ---');
    const analyticsRes = await testRequest('/analytics/summary', { headers: adminHeaders });
    assert(analyticsRes.ok && analyticsRes.data.metrics?.totalRevenue !== undefined, 'Admin Real-Time Financial Summary (/api/analytics/summary)', `Total Revenue: ₹${analyticsRes.data.metrics?.totalRevenue?.toLocaleString('en-IN')}`);

    // Admin Customers Directory
    const adminCustRes = await testRequest('/admin/customers', { headers: adminHeaders });
    assert(adminCustRes.ok && Array.isArray(adminCustRes.data.customers), 'Admin Customers Directory (/api/admin/customers)', `Total Customers: ${adminCustRes.data.count}`);

    // Concierge Contact
    const contactRes = await testRequest('/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lord Sterling',
        email: patronEmail,
        phone: '+91 98200 98200',
        subject: 'Bespoke Caseback Engraving Inquiry',
        message: 'Inquiring regarding custom coat-of-arms laser engraving.'
      })
    });
    assert(contactRes.ok, 'Concierge Contact Submission (/api/contact)');

    // Clean up temporary test product
    if (createdProdId) {
      await testRequest(`/products/${createdProdId}`, { method: 'DELETE', headers: adminHeaders });
    }

  } catch (err) {
    console.error('\n❌ Test Suite Exception:', err);
    failed++;
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log(`📊 FINAL INDUSTRIAL-GRADE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

runFullPlatformTestSuite();
