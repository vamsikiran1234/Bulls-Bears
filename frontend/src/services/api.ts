import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bulls_bears_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      // Clear token if invalid or expired
      localStorage.removeItem('bulls_bears_token');
    }
    return Promise.reject(error);
  }
);

export default api;
