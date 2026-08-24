import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { adminLogin, adminVerify } from '../controllers/authController.js';
import {
  getProducts, getProductById, createProduct, updateProduct, updateStock, deleteProduct
} from '../controllers/productController.js';
import {
  getOrders, getOrderById, createOrder, updateOrderStatus
} from '../controllers/orderController.js';
import {
  getReviews, createReview
} from '../controllers/reviewController.js';
import {
  getCoupons, validateCoupon, createCoupon
} from '../controllers/couponController.js';
import {
  getSummary, getActivityLog, logActivity
} from '../controllers/analyticsController.js';
import {
  getPaymentSettings, updatePaymentSettings, getAdminSecuritySettings, updateAdminSecuritySettings
} from '../controllers/settingsController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Luxury Watch Haute Horlogerie API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.post('/auth/admin/login', adminLogin);
router.get('/auth/admin/verify', requireAdmin, adminVerify);

// Products routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.patch('/products/:id/stock', requireAdmin, updateStock);
router.delete('/products/:id', requireAdmin, deleteProduct);

// Orders routes
router.get('/orders', requireAdmin, getOrders);
router.get('/orders/:id', getOrderById); // Public lookup for consignment tracking
router.post('/orders', createOrder); // Public checkout (stores all order data to DB)
router.patch('/orders/:id/status', requireAdmin, updateOrderStatus);

// Reviews routes
router.get('/reviews', getReviews);
router.post('/reviews', createReview);

// Coupons routes
router.get('/coupons', getCoupons);
router.post('/coupons/validate', validateCoupon);
router.post('/coupons', requireAdmin, createCoupon);

// Analytics & Activity routes
router.get('/analytics/summary', requireAdmin, getSummary);
router.get('/analytics/activity', getActivityLog);
router.post('/analytics/activity', logActivity);

// Settings routes (Payment Gateway & Admin Security)
router.get('/settings/payment', getPaymentSettings);
router.post('/settings/payment', requireAdmin, updatePaymentSettings);
router.get('/settings/admin-security', requireAdmin, getAdminSecuritySettings);
router.post('/settings/admin-security', requireAdmin, updateAdminSecuritySettings);

export default router;
