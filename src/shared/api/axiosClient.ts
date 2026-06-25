import axios, { AxiosError } from 'axios';
import { API_TIMEOUT, API_URL } from '../../config/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud: Inyectar JWT
// Leemos el token desde el mismo lugar que AuthContext lo guarda
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('justme_token') ||
      sessionStorage.getItem('justme_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Unwrap envelope { success, data, timestamp } del backend
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    const isWrapped =
      res &&
      res.data !== undefined &&
      (res.success !== undefined || res.message === 'success' || res.statusCode !== undefined);

    if (isWrapped) {
      response.data = res.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpiamos el token del mismo store que usa AuthContext
      localStorage.removeItem('justme_token');
      localStorage.removeItem('justme_role');
      sessionStorage.removeItem('justme_token');
      sessionStorage.removeItem('justme_role');
      // Disparamos un evento global para que AuthContext pueda reaccionar
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
