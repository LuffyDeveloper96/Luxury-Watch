import assert from 'assert';
import './index.js'; // Starts app on PORT 5000
import paymentService from './services/paymentService.js';
import otpService from './services/otpService.js';
import { env } from './config/env.js';

async function runSecurityVerification() {
  // Give server 500ms to bind to port
  await new Promise(r => setTimeout(r, 500));

  console.log('\n======================================================');
  console.log('🔒 LUXURY WATCH — STEP 1 SECURITY VERIFICATION SUITE');
  console.log('======================================================\n');

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

  const BASE_URL = `http://127.0.0.1:${env.PORT || 5000}/api`;

  try {
    // A. Backend starts & B. /api/health works
    await test('A & B. Backend Server & /api/health Endpoint', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.status, 'online');
      assert.strictEqual(data.mode, 'development');
    });

    // C. Valid admin credentials authenticate (using bcrypt comparison against ADMIN_PASSWORD_HASH)
    await test('C. Valid Admin Credentials Authentication (Bcrypt + Environment Hash)', async () => {
      const res = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: env.ADMIN_EMAIL,
          password: 'LuxuryWatch2026!'
        })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(data.token, 'Should return valid signed JWT token');
      assert.strictEqual(data.user.email, env.ADMIN_EMAIL);
      assert.strictEqual(data.user.password, undefined, 'Password must never be returned');
    });

    // D. Invalid admin password fails
    await test('D. Invalid Admin Password Rejected', async () => {
      const res = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: env.ADMIN_EMAIL,
          password: 'WrongPassword123!'
        })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.token, undefined);
    });

    // E. Unauthorized admin email fails
    await test('E. Unauthorized Admin Email Blocked (403 Forbidden)', async () => {
      const res = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'unauthorized@intruder.com',
          password: 'LuxuryWatch2026!'
        })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 403);
      assert.strictEqual(data.success, false);
    });

    // F. OTP API does NOT return simulatedOtp
    await test('F. OTP API Does NOT Return simulatedOtp in Responses', async () => {
      const res = await fetch(`${BASE_URL}/auth/user/signup/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Security Tester',
          email: `test.${Date.now()}@luxurywatch.com`,
          password: 'Password123!',
          phone: '+91 99999 99999'
        })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.simulatedOtp, undefined, 'simulatedOtp must NOT be present in API response');
      assert.strictEqual(data.step, 'otp');
    });

    // G. 123456 and 888888 cannot bypass OTP authentication
    await test('G. Universal OTP Bypass Codes (123456, 888888) Rejected', async () => {
      const testEmail = `bypass.test.${Date.now()}@luxurywatch.com`;
      // Create session with real OTP
      otpService.createOtpSession(testEmail, 'Tester', 'signup');

      // Attempt verification with bypass code 123456
      const res1 = otpService.verifyOtpSession(testEmail, '123456');
      assert.strictEqual(res1.success, false, '123456 must be rejected');

      // Attempt verification with bypass code 888888
      const res2 = otpService.verifyOtpSession(testEmail, '888888');
      assert.strictEqual(res2.success, false, '888888 must be rejected');

      // Attempt API verify with bypass code
      const apiRes = await fetch(`${BASE_URL}/auth/user/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          otp: '123456'
        })
      });
      const apiData = await apiRes.json();
      assert.strictEqual(apiRes.status, 400);
      assert.strictEqual(apiData.success, false);
    });

    // H. Production mode cannot use mock payment verification
    await test('H. Production Mode Rejects Mock Payment Verification', async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        const mockVerify = await paymentService.verifySignature({
          gatewayOrderId: 'order_LW_12345',
          paymentId: 'pay_mock_123',
          signature: 'mock_verified_signature'
        });
        assert.strictEqual(mockVerify.success, false, 'Mock payment verification must fail in production');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    // I. Production errors do not expose stack traces
    await test('I. Production Error Handler Sanitization', async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        const res = await fetch(`${BASE_URL}/nonexistent-route-error-test`);
        const data = await res.json();
        assert.strictEqual(data.stack, undefined, 'Stack trace must not be exposed in production');
        assert.strictEqual(data.error, undefined, 'Internal error object must not be exposed in production');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

  } catch (err) {
    console.error('Test execution fatal error:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`📊 Security Verification Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runSecurityVerification();
