import assert from 'assert';
import './index.js';
import { getDevOtpSession } from './services/otpService.js';
import { env } from './config/env.js';
import { connectMongoDB } from './config/db.js';

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

async function runComprehensiveUserAuthTests() {
  try {
    await connectMongoDB();
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================================');
  console.log('💎 LUXURY WATCH — USER SIGNUP, 2FA LOGIN & OTP END-TO-END TEST SUITE');
  console.log('======================================================================\n');

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
    const timestamp = Date.now();
    const testEmail = `patron.${timestamp}@luxurywatch.com`;
    const initialPassword = 'InitialSecurePassword2026!';
    const newPassword = 'UpdatedSecurePassword2026!';

    // =========================================================================
    // 1. SIGNUP VALIDATION & INITIATION
    // =========================================================================
    console.log('--- 1. PATRON SIGNUP & SECURE OTP DISPATCH ---');

    // A. Invalid email
    const invalidEmailRes = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ name: 'Lord Test', email: 'invalid-email', password: initialPassword })
    });
    assertTest(invalidEmailRes.status === 400, 'Reject Sign Up with Invalid Email Address');

    // B. Short password (< 6 chars)
    const shortPasswordRes = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ name: 'Lord Test', email: testEmail, password: '123' })
    });
    assertTest(shortPasswordRes.status === 400, 'Reject Sign Up with Password Less Than 6 Characters');

    // C. Valid Sign Up Initiation -> Dispatches 6-Digit OTP
    const signupInitRes = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lord Sterling of Geneva',
        email: testEmail,
        password: initialPassword,
        phone: '+91 98200 98200'
      })
    });
    assertTest(
      signupInitRes.ok && signupInitRes.data.success && signupInitRes.data.step === 'otp',
      'Initiate Sign Up -> OTP Dispatched',
      `Message: "${signupInitRes.data.message}"`
    );
    assertTest(
      signupInitRes.data.simulatedOtp === undefined,
      'Security: simulatedOtp is NOT exposed in Sign Up API Response'
    );

    // =========================================================================
    // 2. OTP VERIFICATION SECURITY & ACCOUNT CREATION
    // =========================================================================
    console.log('\n--- 2. OTP VERIFICATION SECURITY & ACCOUNT CREATION ---');

    // A. Wrong OTP fails
    const wrongOtpRes = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: '999999' })
    });
    assertTest(wrongOtpRes.status === 400, 'Reject Verification with Incorrect 6-Digit OTP');

    // B. Bypass OTP 123456 fails
    const bypass1 = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: '123456' })
    });
    assertTest(bypass1.status === 400, 'Security: Universal Bypass Code 123456 Rejected');

    // C. Bypass OTP 888888 fails
    const bypass2 = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: '888888' })
    });
    assertTest(bypass2.status === 400, 'Security: Universal Bypass Code 888888 Rejected');

    // D. Correct OTP completes registration
    const session = getDevOtpSession(testEmail);
    assertTest(session && session.rawOtp, 'Internal OTP Session Registered for Patron');
    const validOtp = session ? session.rawOtp : '';

    const verifySuccessRes = await testRequest('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: validOtp })
    });
    assertTest(
      verifySuccessRes.ok && verifySuccessRes.data.token && verifySuccessRes.data.user?.email === testEmail,
      'Submit Correct OTP -> Account Verified & JWT Session Issued'
    );
    assertTest(
      verifySuccessRes.data.user.password === undefined,
      'Security: Password Hash Excluded from User Profile Response'
    );

    const userToken = verifySuccessRes.data.token;
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    // =========================================================================
    // 3. DUPLICATE REGISTRATION PREVENTION
    // =========================================================================
    console.log('\n--- 3. DUPLICATE ACCOUNT PREVENTION ---');
    const duplicateRes = await testRequest('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ name: 'Duplicate User', email: testEmail, password: initialPassword })
    });
    assertTest(duplicateRes.status === 400, 'Prevent Duplicate Sign Up with Existing Verified Email');

    // =========================================================================
    // 4. SIGN IN WITH PASSWORD & 2FA OTP CHALLENGE
    // =========================================================================
    console.log('\n--- 4. PASSWORD SIGN IN -> 2FA OTP CHALLENGE ---');

    // A. Wrong password fails
    const wrongPasswordRes = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' })
    });
    assertTest(wrongPasswordRes.status === 401, 'Reject Login with Invalid Password');

    // B. Correct password -> Dispatches 2FA OTP
    const loginInitRes = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: initialPassword })
    });
    assertTest(
      loginInitRes.ok && loginInitRes.data.step === 'otp',
      'Password Verified -> 2FA OTP Challenge Dispatched'
    );
    assertTest(
      loginInitRes.data.simulatedOtp === undefined,
      'Security: simulatedOtp is NOT exposed in Login API Response'
    );

    // C. Verify 2FA OTP
    const loginSession = getDevOtpSession(testEmail);
    const validLoginOtp = loginSession ? loginSession.rawOtp : '';

    const loginVerifyRes = await testRequest('/auth/user/login/verify', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, otp: validLoginOtp })
    });
    assertTest(
      loginVerifyRes.ok && loginVerifyRes.data.token,
      'Verify 2FA OTP -> Authenticate Patron Session'
    );

    // =========================================================================
    // 5. AUTHENTICATED PATRON PROFILE & ADDRESSES
    // =========================================================================
    console.log('\n--- 5. AUTHENTICATED USER OPERATIONS ---');

    // A. Profile Lookup
    const meRes = await testRequest('/auth/user/me', { headers: userHeaders });
    assertTest(meRes.ok && meRes.data.user?.email === testEmail, 'Fetch Authenticated Patron Profile (/api/auth/user/me)');

    // B. Add Shipping Address
    const addressRes = await testRequest('/auth/user/addresses', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        fullName: 'Lord Sterling',
        phone: '+91 98200 98200',
        street: 'The Capital, G-Block, Bandra Kurla Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        country: 'India',
        isDefault: true
      })
    });
    assertTest(addressRes.ok && addressRes.data.address?.id, 'Add Consignment Shipping Address');

    // =========================================================================
    // 6. FORGOT & RESET PASSWORD VIA OTP
    // =========================================================================
    console.log('\n--- 6. FORGOT & RESET PASSWORD VIA OTP ---');

    // A. Request Password Reset OTP
    const forgotRes = await testRequest('/auth/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail })
    });
    assertTest(
      forgotRes.ok && forgotRes.data.step === 'otp',
      'Initiate Forgot Password -> Password Reset OTP Dispatched'
    );

    const resetSession = getDevOtpSession(testEmail);
    const resetOtp = resetSession ? resetSession.rawOtp : '';

    // B. Reset Password with OTP
    const resetRes = await testRequest('/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        otp: resetOtp,
        newPassword
      })
    });
    assertTest(
      resetRes.ok && resetRes.data.token,
      'Submit Reset OTP & New Password -> Password Updated Successfully'
    );

    // C. Verify Old Password is now invalid
    const oldLoginRes = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: initialPassword })
    });
    assertTest(oldLoginRes.status === 401, 'Old Password Successfully Invalidated');

    // D. Verify New Password works
    const newLoginRes = await testRequest('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: newPassword })
    });
    assertTest(newLoginRes.ok && newLoginRes.data.step === 'otp', 'New Password Successfully Authenticates Patron');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`📊 USER AUTHENTICATION & OTP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runComprehensiveUserAuthTests();
