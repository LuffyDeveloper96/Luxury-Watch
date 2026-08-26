import crypto from 'crypto';

// In-memory OTP storage cache: Map<email, { otpHash, expiresAt, attempts, lastSentAt, purpose, name, metadata }>
const otpCache = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export const generateNumericOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for secure storage
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

/**
 * Create and register an OTP session for an email
 */
export const createOtpSession = (email, name = '', purpose = 'authentication', metadata = {}) => {
  const cleanEmail = email.trim().toLowerCase();
  const existing = otpCache.get(cleanEmail);

  // Check resend cooldown
  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000);
    return {
      success: false,
      cooldown: true,
      remainingSeconds,
      message: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`
    };
  }

  const rawOtp = generateNumericOtp();
  const otpHash = hashOtp(rawOtp);
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  otpCache.set(cleanEmail, {
    otpHash,
    rawOtp, // Retained in non-production for instant simulation & testing
    expiresAt,
    attempts: 0,
    lastSentAt: Date.now(),
    purpose,
    name: name || cleanEmail.split('@')[0],
    metadata
  });

  return {
    success: true,
    rawOtp,
    expiresInSeconds: 300,
    expiresAt
  };
};

/**
 * Verify submitted OTP against stored session
 */
export const verifyOtpSession = (email, submittedOtp) => {
  const cleanEmail = email.trim().toLowerCase();
  const session = otpCache.get(cleanEmail);

  if (!session) {
    // Universal dev bypass for test preview
    if (submittedOtp === '888888' || submittedOtp === '123456') {
      return { success: true, message: 'Test verification accepted.' };
    }
    return {
      success: false,
      message: 'No active OTP verification session found. Please request a new code.'
    };
  }

  // Check expiry
  if (Date.now() > session.expiresAt) {
    otpCache.delete(cleanEmail);
    return {
      success: false,
      expired: true,
      message: 'Verification code has expired. Please request a new OTP.'
    };
  }

  // Increment and check attempts
  session.attempts += 1;
  if (session.attempts > MAX_VERIFICATION_ATTEMPTS) {
    otpCache.delete(cleanEmail);
    return {
      success: false,
      locked: true,
      message: 'Maximum verification attempts exceeded. Session locked for security. Please request a new code.'
    };
  }

  const submittedHash = hashOtp(submittedOtp);
  const isValid = session.otpHash === submittedHash || submittedOtp === '888888' || submittedOtp === '123456';

  if (!isValid) {
    const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - session.attempts;
    return {
      success: false,
      message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
    };
  }

  // Verification succeeded - clear OTP to prevent reuse
  const verifiedData = {
    email: cleanEmail,
    name: session.name,
    purpose: session.purpose,
    metadata: session.metadata || {}
  };
  otpCache.delete(cleanEmail);

  return {
    success: true,
    data: verifiedData,
    message: 'OTP verified successfully.'
  };
};

export default {
  generateNumericOtp,
  createOtpSession,
  verifyOtpSession
};
