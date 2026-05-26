import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_URL, API_TIMEOUT } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('justme_token') || sessionStorage.getItem('justme_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle global errors and unwrap standard API responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap the standard backend response format { success: true, data: ... }
    // Robust check for different backend response styles
    const res = response.data;
    const isWrapped = res && res.data !== undefined && (res.success !== undefined || res.message === 'success' || res.statusCode !== undefined);
    
    if (isWrapped) {
      response.data = res.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const configToken = error.config?.headers?.Authorization?.toString().split(' ')[1];
      const currentToken = localStorage.getItem('justme_token') || sessionStorage.getItem('justme_token');
      
      // Only clear if the token that failed is the one we have currently
      if (configToken === currentToken || !currentToken) {
        console.warn('Unauthorized access - clearing session');
        localStorage.removeItem('justme_token');
        localStorage.removeItem('justme_role');
        sessionStorage.removeItem('justme_token');
        sessionStorage.removeItem('justme_role');
        // Dispatch custom event to let AuthContext know it should log out
        window.dispatchEvent(new Event('auth:unauthorized'));
      } else {
        console.warn('Ignoring 401 from an old/different token');
      }
    }
    return Promise.reject(error);
  }
);
