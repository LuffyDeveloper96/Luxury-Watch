import express from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { apiLimiter, otpLimiter, paymentLimiter } from '../middleware/rateLimiter.js';

// Controllers
import { adminLogin, adminVerify } from '../controllers/authController.js';
import {
  initiateUserSignup, verifyUserSignup,
  initiateUserLogin, verifyUserLogin,
  forgotPasswordInit, resetPasswordWithOtp,
  sendUserOtp, verifyUserOtp, getMe,
  addAddress, deleteAddress, setDefaultAddress, getAdminCustomers
} from '../controllers/userAuthController.js';
import {
  getProducts, getProductByIdOrSlug, getSearchSuggestions,
  createProduct, updateProduct, updateStock, deleteProduct
} from '../controllers/productController.js';
import {
  getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand
} from '../controllers/brandController.js';
import {
  getCategories, createCategory, updateCategory, deleteCategory
} from '../controllers/categoryController.js';
import {
  getOrders, getOrderById, getUserOrders, createOrder, updateOrderStatus, cancelOrder
} from '../controllers/orderController.js';
import {
  createRazorpayOrder, verifyRazorpayPayment, recordPaymentFailure
} from '../controllers/paymentController.js';
import {
  getCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon
} from '../controllers/couponController.js';
import {
  getReviews, createReview, updateReviewStatus, deleteReview
} from '../controllers/reviewController.js';
import {
  createReturn, getReturns, lookupReturn, updateReturnStatus
} from '../controllers/returnController.js';
import {
  getSummary, getActivityLog, logActivity
} from '../controllers/analyticsController.js';
import {
  getHomepageContent, updateHomepageContent
} from '../controllers/homepageController.js';
import {
  getPaymentSettings, updatePaymentSettings,
  getStoreSettings, updateStoreSettings,
  getAdminSecuritySettings, updateAdminSecuritySettings
} from '../controllers/settingsController.js';
import {
  submitContact, getContacts
} from '../controllers/contactController.js';

const router = express.Router();

// Apply Global API rate limiter
router.use(apiLimiter);

// 1. System Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'LUXURY WATCH — Haute Horlogerie Production API Engine',
    version: '2.0.0',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 2. Administrator Authentication (Strictly Single Seeded Admin Account)
router.post('/auth/admin/login', adminLogin);
router.get('/auth/admin/verify', requireAdmin, adminVerify);

// 3. User Authentication & Profile (Email + Password + OTP Verification)
router.post('/auth/user/signup/init', otpLimiter, initiateUserSignup);
router.post('/auth/user/signup/verify', verifyUserSignup);
router.post('/auth/user/login/init', otpLimiter, initiateUserLogin);
router.post('/auth/user/login/verify', verifyUserLogin);
router.post('/auth/user/forgot-password', otpLimiter, forgotPasswordInit);
router.post('/auth/user/reset-password', resetPasswordWithOtp);

// Legacy & Direct OTP endpoints
router.post('/auth/user/send-otp', otpLimiter, sendUserOtp);
router.post('/auth/user/verify-otp', verifyUserOtp);

// Patron Profile & Address Management
router.get('/auth/user/me', requireAuth, getMe);
router.post('/auth/user/addresses', requireAuth, addAddress);
router.delete('/auth/user/addresses/:id', requireAuth, deleteAddress);
router.put('/auth/user/addresses/:id/default', requireAuth, setDefaultAddress);
router.get('/admin/customers', requireAdmin, getAdminCustomers);

// 4. Products API
router.get('/products', getProducts);
router.get('/products/search/suggestions', getSearchSuggestions);
router.get('/products/:id', getProductByIdOrSlug);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.patch('/products/:id/stock', requireAdmin, updateStock);
router.delete('/products/:id', requireAdmin, deleteProduct);

// 5. Brands API (Database-driven for circular showcase)
router.get('/brands', getBrands);
router.get('/brands/:slugOrId', getBrandBySlug);
router.post('/brands', requireAdmin, createBrand);
router.put('/brands/:id', requireAdmin, updateBrand);
router.delete('/brands/:id', requireAdmin, deleteBrand);

// 6. Categories API
router.get('/categories', getCategories);
router.post('/categories', requireAdmin, createCategory);
router.put('/categories/:id', requireAdmin, updateCategory);
router.delete('/categories/:id', requireAdmin, deleteCategory);

// 7. Orders API
router.get('/orders', requireAdmin, getOrders);
router.get('/orders/user', requireAuth, getUserOrders);
router.get('/orders/:id', getOrderById); // Public lookup for consignment tracking
router.post('/orders', createOrder);
router.patch('/orders/:id/status', requireAdmin, updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);

// 8. Payments API (Razorpay + Verification)
router.post('/payments/razorpay/order', paymentLimiter, createRazorpayOrder);
router.post('/payments/razorpay/verify', verifyRazorpayPayment);
router.post('/payments/failure', recordPaymentFailure);

// 9. VIP Coupons Engine API
router.get('/coupons', requireAdmin, getCoupons);
router.post('/coupons/validate', validateCoupon);
router.post('/coupons', requireAdmin, createCoupon);
router.put('/coupons/:id', requireAdmin, updateCoupon);
router.delete('/coupons/:id', requireAdmin, deleteCoupon);

// 10. Reviews & Testimonials API
router.get('/reviews', getReviews);
router.post('/reviews', createReview);
router.patch('/reviews/:id/status', requireAdmin, updateReviewStatus);
router.delete('/reviews/:id', requireAdmin, deleteReview);

// 11. Returns & Exchange Concierge API
router.post('/returns', createReturn);
router.get('/returns/lookup', lookupReturn);
router.get('/returns', requireAdmin, getReturns);
router.patch('/returns/:id/status', requireAdmin, updateReturnStatus);

// 12. Analytics & Financial KPIs
router.get('/analytics/summary', requireAdmin, getSummary);
router.get('/analytics/activity', getActivityLog);
router.post('/analytics/activity', logActivity);

// 13. Homepage CMS
router.get('/homepage/content', getHomepageContent);
router.put('/homepage/content', requireAdmin, updateHomepageContent);

// 14. Settings & Payment Gateways
router.get('/settings/payment', requireAdmin, getPaymentSettings);
router.put('/settings/payment', requireAdmin, updatePaymentSettings);
router.get('/settings/store', getStoreSettings);
router.put('/settings/store', requireAdmin, updateStoreSettings);
router.get('/settings/security', requireAdmin, getAdminSecuritySettings);
router.put('/settings/security', requireAdmin, updateAdminSecuritySettings);

// 15. Concierge Contact Form
router.post('/contact', submitContact);
router.get('/contact', requireAdmin, getContacts);

export default router;
