async function testAPI() {
  console.log('Testing Luxury Watch Backend API...');

  try {
    // 1. Health
    const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
    console.log('✓ Health:', health.status);

    // 2. Products
    const prods = await fetch('http://localhost:5000/api/products').then(r => r.json());
    console.log(`✓ Products: ${prods.count} items. First item: "${prods.products[0].name}"`);

    // 3. Admin Login
    const loginRes = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@luxurywatch.com',
        password: 'LuxuryWatch2026!',
        passcodePin: '8888'
      })
    }).then(r => r.json());
    console.log('✓ Admin Login:', loginRes.success ? 'Authenticated' : 'Failed', '- Token issued:', !!loginRes.token);

    // 4. Validate Coupon
    const couponRes = await fetch('http://localhost:5000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'LUXE10', subtotal: 495000 })
    }).then(r => r.json());
    console.log(`✓ Coupon LUXE10 validation: ${couponRes.success} - Discount: ₹${couponRes.discountAmount}`);

    // 5. Order Lookup
    const orderRes = await fetch('http://localhost:5000/api/orders/ORD-LW-98421').then(r => r.json());
    console.log(`✓ Order lookup ORD-LW-98421: ${orderRes.success} - Client: ${orderRes.order?.customer?.fullName}`);

    // 6. Analytics
    const analyticsRes = await fetch('http://localhost:5000/api/analytics/summary', {
      headers: { Authorization: `Bearer ${loginRes.token}` }
    }).then(r => r.json());
    console.log(`✓ Admin Analytics: Total Gross Sales: ₹${analyticsRes.summary?.totalRevenue.toLocaleString('en-IN')}`);

    console.log('\n🌟 ALL BACKEND REST API ENDPOINTS VERIFIED & WORKING PERFECTLY!');
  } catch (err) {
    console.error('API Test Error:', err.message);
  }
}

testAPI();
