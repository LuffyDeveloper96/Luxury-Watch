import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAdmin, requireAuth, optionalAuth } from '../middleware/auth.js';
import { apiLimiter, otpLimiter, paymentLimiter } from '../middleware/rateLimiter.js';

// Setup Multer for media uploads (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max size for HD product videos and images
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.originalname);
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported media format. Please upload an image (JPG, PNG, WebP) or video (MP4, WebM, MOV).'));
    }
  }
});

import { Image } from '../models/Image.js';

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
  createRazorpayOrder, verifyRazorpayPayment, handleRazorpayWebhook, recordPaymentFailure, cleanupAbandonedPayments
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
import {
  getCart, addToCart, updateCartQuantity, removeFromCart, clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// Apply Global API rate limiter
router.use(apiLimiter);

// 0. Media Upload Route (Stores in MongoDB for persistence on free tier)
router.post('/upload', requireAdmin, (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const file = req.files?.[0] || req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const newImage = new Image({
      data: file.buffer,
      contentType: file.mimetype || 'image/jpeg'
    });
    await newImage.save();

    const mediaUrl = `/api/images/${newImage._id}`;
    const mediaType = file.mimetype?.startsWith('video/') ? 'video' : 'image';
    res.json({ success: true, url: mediaUrl, type: mediaType, contentType: file.mimetype });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ success: false, message: 'Media upload failed' });
  }
});

// 0.1 Media / Image Fetch Route with HTTP Range Request Support for Video Streaming
router.get('/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).send('Media not found');
    }

    const buffer = image.data;
    if (!buffer) {
      return res.status(404).send('Media buffer is empty');
    }

    const totalSize = buffer.length;
    const contentType = image.contentType || 'image/jpeg';
    const range = req.headers.range;

    res.set('Accept-Ranges', 'bytes');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || start >= totalSize || (end !== undefined && end >= totalSize) || start > end) {
        res.status(416).set('Content-Range', `bytes */${totalSize}`);
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      const chunk = buffer.subarray ? buffer.subarray(start, end + 1) : buffer.slice(start, end + 1);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      return res.end(chunk);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      return res.end(buffer);
    }
  } catch (err) {
    console.error('Fetch media error:', err);
    res.status(500).send('Server Error');
  }
});

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

// 3. User Authentication & Profile (Direct Email + Password Authentication)
router.post('/auth/user/signup', initiateUserSignup);
router.post('/auth/user/signup/init', initiateUserSignup);
router.post('/auth/user/login', initiateUserLogin);
router.post('/auth/user/login/init', initiateUserLogin);
router.post('/auth/user/forgot-password', otpLimiter, forgotPasswordInit);
router.post('/auth/user/reset-password', resetPasswordWithOtp);

// Patron Profile & Address Management
router.get('/auth/user/me', requireAuth, getMe);
router.post('/auth/user/addresses', requireAuth, addAddress);
router.delete('/auth/user/addresses/:id', requireAuth, deleteAddress);
router.put('/auth/user/addresses/:id/default', requireAuth, setDefaultAddress);
router.get('/admin/customers', requireAdmin, getAdminCustomers);

// Persistent Cart API
router.get('/cart', requireAuth, getCart);
router.post('/cart', requireAuth, addToCart);
router.put('/cart/:productId', requireAuth, updateCartQuantity);
router.delete('/cart/:productId', requireAuth, removeFromCart);
router.delete('/cart', requireAuth, clearCart);

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
router.get('/orders/:id', optionalAuth, getOrderById); // Order details with privacy controls
router.post('/orders', requireAdmin, createOrder); // Admin offline order entry only
router.patch('/orders/:id/status', requireAdmin, updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);

// 8. Payments API (Razorpay Standard Web Checkout + Verification + Webhook)
router.post('/create-order', paymentLimiter, createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);
router.post('/payments/razorpay/order', paymentLimiter, createRazorpayOrder);
router.post('/payments/razorpay/verify', verifyRazorpayPayment);
router.post('/payments/razorpay/webhook', handleRazorpayWebhook);
router.post('/payments/webhook', handleRazorpayWebhook);
router.post('/payments/failure', recordPaymentFailure);
router.post('/payments/cleanup-abandoned', requireAdmin, cleanupAbandonedPayments);

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
router.get('/returns/lookup', optionalAuth, lookupReturn); // Returns lookup with privacy controls
router.get('/returns/lookup/:orderOrReturnId', optionalAuth, lookupReturn);
router.get('/returns', requireAdmin, getReturns);
router.patch('/returns/:id/status', requireAdmin, updateReturnStatus);

// 12. Analytics & Financial KPIs
router.get('/analytics/summary', requireAdmin, getSummary);
router.get('/analytics/activity', getActivityLog);
router.post('/analytics/activity', logActivity);

// 13. Homepage CMS
router.get('/homepage', getHomepageContent);
router.get('/homepage/content', getHomepageContent);
router.put('/homepage', requireAdmin, updateHomepageContent);
router.put('/homepage/content', requireAdmin, updateHomepageContent);

// 14. Settings & Payment Gateways
router.get('/settings/payment', requireAdmin, getPaymentSettings);
router.put('/settings/payment', requireAdmin, updatePaymentSettings);
router.post('/settings/payment', requireAdmin, updatePaymentSettings);
router.get('/settings/store', getStoreSettings);
router.put('/settings/store', requireAdmin, updateStoreSettings);
router.post('/settings/store', requireAdmin, updateStoreSettings);
router.get('/settings/security', requireAdmin, getAdminSecuritySettings);
router.get('/settings/admin-security', requireAdmin, getAdminSecuritySettings);
router.put('/settings/security', requireAdmin, updateAdminSecuritySettings);
router.post('/settings/security', requireAdmin, updateAdminSecuritySettings);
router.post('/settings/admin-security', requireAdmin, updateAdminSecuritySettings);

// 15. Concierge Contact Form
router.post('/contact', submitContact);
router.get('/contact', requireAdmin, getContacts);

export default router;
