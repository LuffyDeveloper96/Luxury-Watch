import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter (200 requests per 15 minutes per IP)
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
 * Authentication rate limiter for login and registration brute-force protection
 * (20 attempts per 15 minutes per IP)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait a few minutes before trying again.'
  }
});

/**
 * Checkout / Payment initiation rate limiter
 */
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many checkout requests. Please wait a moment.'
  }
});

export default {
  apiLimiter,
  authLimiter,
  paymentLimiter
};
