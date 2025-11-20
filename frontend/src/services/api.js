import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API DEBUG] Request to ${config.url} with token: ${token.substring(0, 50)}...`);
    } else {
      console.log(`[API DEBUG] Request to ${config.url} without token`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// Admin API
export const adminAPI = {
  createFarmer: (data) => api.post('/admin/farmers/create', data),
  getAllFarmers: (params) => api.get('/admin/farmers', { params }),
  getAllBuyers: (params) => api.get('/admin/buyers', { params }),
  toggleUserStatus: (userId) => api.patch(`/admin/users/${userId}/toggle-status`),
  getPendingProducts: (params) => api.get('/admin/products/pending', { params }),
  approveProduct: (productId) => api.patch(`/admin/products/${productId}/approve`),
  rejectProduct: (productId) => api.delete(`/admin/products/${productId}/reject`),
  getPendingOrders: (params) => api.get('/admin/orders/pending', { params }),
  approveOrder: (orderId) => api.patch(`/admin/orders/${orderId}/approve`),
  rejectOrder: (orderId, data) => api.patch(`/admin/orders/${orderId}/reject`, data),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (categoryId, data) => api.patch(`/admin/categories/${categoryId}`, data),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
};

// Farmer API
export const farmerAPI = {
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.patch('/farmer/profile', data),
  getMyProducts: (params) => api.get('/farmer/products', { params }),
  createProduct: (data) => api.post('/farmer/products', data),
  getProduct: (productId) => api.get(`/farmer/products/${productId}`),
  updateProduct: (productId, data) => api.patch(`/farmer/products/${productId}`, data),
  deleteProduct: (productId) => api.delete(`/farmer/products/${productId}`),
  getOrders: (params) => api.get('/farmer/orders', { params }),
  getAnalytics: () => api.get('/farmer/analytics'),
};

// Buyer API
export const buyerAPI = {
  getProfile: () => api.get('/buyer/profile'),
  updateProfile: (data) => api.patch('/buyer/profile', data),
  getMyOrders: (params) => api.get('/buyer/orders', { params }),
  getOrder: (orderId) => api.get(`/buyer/orders/${orderId}`),
};

// Products API (Public)
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (productId) => api.get(`/products/${productId}`),
  getCategories: () => api.get('/products/categories'),
  getFeaturedProducts: (params) => api.get('/products/featured', { params }),
  getLatestProducts: (params) => api.get('/products/latest', { params }),
  getSearchFilters: () => api.get('/products/search-filters'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/items', data),
  updateCartItem: (cartItemId, data) => api.patch(`/cart/items/${cartItemId}`, data),
  removeFromCart: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  confirmOrder: (data) => api.post('/orders/confirm', data),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (filename) => api.delete(`/upload/images/${filename}`),
};

export default api;
