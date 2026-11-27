import axios from 'axios';
import {
  getAccessToken,
  isAccessTokenExpired,
  refreshTokens,
  clearTokens,
} from '../auth/token-manager';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.headers['Skip-Auth']) {
    delete config.headers['Skip-Auth'];
    return config;
  }

  let token = getAccessToken();

  if (token && isAccessTokenExpired()) {
    try {
      await refreshTokens();
      token = getAccessToken();
    } catch {
      return config;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const FATAL_AUTH_CODES = new Set([
  'REFRESH_TOKEN_REUSED',
  'REFRESH_TOKEN_EXPIRED',
  'SESSION_REVOKED',
  'ACCOUNT_DEACTIVATED',
]);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || originalRequest._retried) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const code = error.response.data?.error?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retried) {
      originalRequest._retried = true;

      try {
        await refreshTokens();
        const newToken = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    if (status === 401 && FATAL_AUTH_CODES.has(code)) {
      clearTokens();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
