import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartlink_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Axios response interceptor — auto-logout on expired / invalid token
let isLoggingOut = false; // debounce flag to prevent toast spam from parallel 401s

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      // Skip auto-logout for login/register endpoints (user just typed wrong password)
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        isLoggingOut = true;

        const reason =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Your session has expired';

        // Clear auth state
        localStorage.removeItem('smartlink_token');
        localStorage.removeItem('smartlink_user');

        // Show a toast via a custom DOM event (picked up by ToastContext)
        window.dispatchEvent(
          new CustomEvent('smartlink:session-expired', { detail: { reason } })
        );

        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
          isLoggingOut = false;
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload)
};

export const linksApi = {
  list: (params = {}) => api.get('/links', { params }),
  create: (payload) => api.post('/links', payload),
  getById: (id) => api.get(`/links/${id}`),
  update: (id, payload) => api.patch(`/links/${id}`, payload),
  remove: (id) => api.delete(`/links/${id}`),
  refreshHealth: (id) => api.post(`/links/${id}/refresh-health`)
};

export const collectionsApi = {
  list: () => api.get('/collections'),
  create: (payload) => api.post('/collections', payload),
  getById: (id) => api.get(`/collections/${id}`),
  update: (id, payload) => api.put(`/collections/${id}`, payload),
  remove: (id) => api.delete(`/collections/${id}`),
  getPublic: (slug) => api.get(`/collections/public/${slug}`)
};

export const analyticsApi = {
  getStats: (linkId) => api.get(`/analytics/${linkId}`),
  getEvents: (linkId, limit = 50) => api.get(`/analytics/${linkId}/events`, { params: { limit } })
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (payload) => api.patch('/users/me', payload)
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getLinks: () => api.get('/admin/links'),
  deleteLink: (id) => api.delete(`/admin/links/${id}`)
};

export default api;
