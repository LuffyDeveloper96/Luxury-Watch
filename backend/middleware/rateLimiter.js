import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter (150 requests per 15 minutes per IP)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this connection. Please try again in a few minutes.'
  }
});

/**
 * Strict OTP request rate limiter (10 OTP requests per 10 minutes per IP)
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'OTP dispatch limit reached. Please wait before requesting another verification code.'
  }
});

/**
 * Checkout / Payment initiation rate limiter
 */
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many checkout requests. Please wait a moment.'
  }
});

export default {
  apiLimiter,
  otpLimiter,
  paymentLimiter
};
