// Base API Configuration
const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('akiki_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };

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

// Authentication API
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

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },
  getById: async (id) => {
    return request(`/products/${id}`);
  },
  create: async (productData) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
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

// Orders API
export const ordersAPI = {
  getAll: async () => {
    return request('/orders');
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
  updateStatus: async (id, orderStatus) => {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus })
    });
  }
};

// Reviews API
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
  }
};

// Coupons API
export const couponsAPI = {
  getAll: async () => {
    return request('/coupons');
  },
  validate: async (code, subtotal) => {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  },
  create: async (couponData) => {
    return request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  }
};

// Analytics & Activity API
export const analyticsAPI = {
  getSummary: async () => {
    return request('/analytics/summary');
  },
  getActivity: async () => {
    return request('/analytics/activity');
  },
  logActivity: async (text, type = 'general') => {
    return request('/analytics/activity', {
      method: 'POST',
      body: JSON.stringify({ text, type })
    });
  }
};

// Settings API (Payment Gateway & Admin Security)
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

