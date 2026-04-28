import axios from 'axios';
import { emitAuthExpired } from '../lib/events';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lm_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    params: config.params,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.debug(`[API] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const config = error.config;

    // 503 Service Unavailable Retry Logic
    if (error.response?.status === 503 && config && !config._isRetryExhausted) {
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < 3) {
        config._retryCount += 1;
        console.warn(`[API] 503 Service Unavailable. Retrying request (${config._retryCount}/3) in 15 seconds...`);
        
        // Wait for 15 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 15000));
        
        return api(config);
      } else {
        config._isRetryExhausted = true;
      }
    }

    if (
      error.response?.status === 401 &&
      localStorage.getItem('lm_token') &&
      !config?.url?.includes('/auth/login') &&
      !config?.url?.includes('/auth/register')
    ) {
      emitAuthExpired();
    }

    console.error('[API] request failed', {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.code === 'ECONNABORTED') {
    return 'The request took too long. Please check your connection and try again.';
  }
  
  if (error.response?.status === 503) {
    return 'Service is busy, please try again later.';
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  );
}

export default api;
