import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const defaultApiBaseUrl = isLocalhost ? '/api' : '/_/backend/api';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const contentType = res.headers?.['content-type'] || '';
    if (typeof res.data === 'string' && contentType.includes('text/html')) {
      return Promise.reject(new Error('API response returned HTML. Check API base URL/deployment routing.'));
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
