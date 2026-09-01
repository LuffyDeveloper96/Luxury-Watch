// Base API Configuration (Supports VITE_API_URL or relative /api proxy)
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const getAuthHeaders = () => {
  const adminToken = localStorage.getItem('luxury_admin_token') || localStorage.getItem('akiki_admin_token');
  const userToken = localStorage.getItem('luxury_user_token');
  const token = adminToken || userToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('/api/images/')) {
    const backendBase = API_BASE.replace(/\/api$/, '');
    return `${backendBase}${url}`;
  }
  return url;
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  // Auto-set Content-Type for JSON, but let browser handle FormData boundaries
  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API Request Error] ${endpoint}:`, err.message);
    throw err;
  }
}

// 1. Admin Authentication API
export const authAPI = {
  login: async (credentials) => {
    return request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  verify: async () => {
    return request('/auth/admin/verify');
  }
};

// 2. User Authentication API (Email + Password + OTP Verification)
export const userAuthAPI = {
  // Sign Up Flow
  initiateSignup: async ({ name, email, password, phone }) => {
    return request('/auth/user/signup/init', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
  },
  verifySignup: async ({ email, otp }) => {
    return request('/auth/user/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  },

  // Sign In Flow (Email + Password -> 2FA OTP)
  initiateLogin: async ({ email, password }) => {
    return request('/auth/user/login/init', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  verifyLogin: async ({ email, otp }) => {
    return request('/auth/user/login/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  },

  // Password Reset Flow
  forgotPassword: async (email) => {
    return request('/auth/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  resetPassword: async ({ email, otp, newPassword }) => {
    return request('/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    });
  },

  // Legacy & direct OTP helpers
  sendOtp: async (email, name, purpose = 'login') => {
    return request('/auth/user/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, name, purpose })
    });
  },
  verifyOtp: async (email, otp, name = '', phone = '') => {
    return request('/auth/user/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, name, phone })
    });
  },
  getMe: async (token) => {
    return request('/auth/user/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
  updateProfile: async (profileData) => {
    return request('/auth/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },
  addAddress: async (addressData) => {
    return request('/auth/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },
  deleteAddress: async (addressId) => {
    return request(`/auth/user/addresses/${addressId}`, {
      method: 'DELETE'
    });
  },
  getCustomers: async () => {
    return request('/admin/customers');
  }
};

// 3. Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.brand && params.brand !== 'All') query.append('brand', params.brand);
    if (params.gender && params.gender !== 'All') query.append('gender', params.gender);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.movement && params.movement !== 'All') query.append('movement', params.movement);
    if (params.dialColor && params.dialColor !== 'All') query.append('dialColor', params.dialColor);
    if (params.strapMaterial && params.strapMaterial !== 'All') query.append('strapMaterial', params.strapMaterial);
    if (params.rating) query.append('rating', params.rating);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },
  getByIdOrSlug: async (idOrSlug) => {
    return request(`/products/${encodeURIComponent(idOrSlug)}`);
  },
  getSuggestions: async (term) => {
    return request(`/products/search/suggestions?q=${encodeURIComponent(term)}`);
  },
  create: async (productData) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/upload', {
      method: 'POST',
      body: formData
    });
  },
  update: async (id, productData) => {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  updateStock: async (id, deltaOrAbsolute) => {
    return request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(deltaOrAbsolute)
    });
  },
  delete: async (id) => {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// 4. Brands API (Database-driven)
export const brandsAPI = {
  getAll: async () => {
    return request('/brands');
  },
  getBySlug: async (slugOrId) => {
    return request(`/brands/${encodeURIComponent(slugOrId)}`);
  },
  create: async (brandData) => {
    return request('/brands', {
      method: 'POST',
      body: JSON.stringify(brandData)
    });
  },
  update: async (id, brandData) => {
    return request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData)
    });
  },
  delete: async (id) => {
    return request(`/brands/${id}`, {
      method: 'DELETE'
    });
  }
};

// 5. Categories API
export const categoriesAPI = {
  getAll: async () => {
    return request('/categories');
  },
  create: async (catData) => {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(catData)
    });
  },
  update: async (id, catData) => {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(catData)
    });
  },
  delete: async (id) => {
    return request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

// 6. Orders API
export const ordersAPI = {
  getAll: async () => {
    return request('/orders');
  },
  getUserOrders: async () => {
    return request('/orders/user');
  },
  getById: async (idOrTracking) => {
    return request(`/orders/${encodeURIComponent(idOrTracking)}`);
  },
  create: async (orderData) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  updateStatus: async (id, orderStatus, trackingNumber, courierTier) => {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus, trackingNumber, courierTier })
    });
  },
  cancel: async (id, reason) => {
    return request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};

// 7. Payments API (Razorpay Standard Web Checkout)
export const paymentsAPI = {
  createOrder: async (orderData) => {
    return request('/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  verifyPayment: async (verificationData) => {
    return request('/verify-payment', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  },
  createRazorpayOrder: async (paymentData) => {
    return request('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },
  verifyRazorpayPayment: async (verificationData) => {
    return request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  },
  logFailure: async (failureData) => {
    return request('/payments/failure', {
      method: 'POST',
      body: JSON.stringify(failureData)
    });
  }
};

// 8. Coupons API
export const couponsAPI = {
  getAll: async () => {
    return request('/coupons');
  },
  validate: async (code, subtotal, items = []) => {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal, items })
    });
  },
  create: async (couponData) => {
    return request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  },
  update: async (code, couponData) => {
    return request(`/coupons/${code}`, {
      method: 'PUT',
      body: JSON.stringify(couponData)
    });
  },
  delete: async (code) => {
    return request(`/coupons/${code}`, {
      method: 'DELETE'
    });
  }
};

// 9. Reviews API
export const reviewsAPI = {
  getAll: async (productId) => {
    const query = productId ? `?productId=${productId}` : '';
    return request(`/reviews${query}`);
  },
  create: async (reviewData) => {
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },
  updateStatus: async (id, status) => {
    return request(`/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  delete: async (id) => {
    return request(`/reviews/${id}`, {
      method: 'DELETE'
    });
  }
};

// 10. Returns API
export const returnsAPI = {
  create: async (returnData) => {
    return request('/returns', {
      method: 'POST',
      body: JSON.stringify(returnData)
    });
  },
  getAll: async () => {
    return request('/returns');
  },
  lookup: async (orderOrReturnId) => {
    return request(`/returns/lookup/${encodeURIComponent(orderOrReturnId)}`);
  },
  updateStatus: async (id, status, resolutionNotes) => {
    return request(`/returns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes })
    });
  }
};

// 11. Analytics & Activity API
export const analyticsAPI = {
  getSummary: async () => {
    return request('/analytics/summary');
  },
  getActivity: async () => {
    return request('/analytics/activity');
  },
  logActivity: async (text, type = 'general', badge = '') => {
    return request('/analytics/activity', {
      method: 'POST',
      body: JSON.stringify({ text, type, badge })
    });
  }
};

// 12. Homepage CMS API
export const homepageAPI = {
  getContent: async () => {
    return request('/homepage');
  },
  updateContent: async (contentData) => {
    return request('/homepage', {
      method: 'PUT',
      body: JSON.stringify(contentData)
    });
  }
};

// 13. Settings API
export const settingsAPI = {
  getPaymentSettings: async () => {
    return request('/settings/payment');
  },
  updatePaymentSettings: async (settingsData) => {
    return request('/settings/payment', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    });
  },
  getStoreSettings: async () => {
    return request('/settings/store');
  },
  updateStoreSettings: async (settingsData) => {
    return request('/settings/store', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    });
  },
  getAdminSecurity: async () => {
    return request('/settings/admin-security');
  },
  updateAdminSecurity: async (authorizedEmail) => {
    return request('/settings/admin-security', {
      method: 'POST',
      body: JSON.stringify({ authorizedEmail })
    });
  }
};

// 14. Contact Concierge API
export const contactAPI = {
  submit: async (contactData) => {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  },
  getAll: async () => {
    return request('/contact');
  }
};

export default {
  authAPI,
  userAuthAPI,
  productsAPI,
  brandsAPI,
  categoriesAPI,
  ordersAPI,
  paymentsAPI,
  couponsAPI,
  reviewsAPI,
  returnsAPI,
  analyticsAPI,
  homepageAPI,
  settingsAPI,
  contactAPI
};
