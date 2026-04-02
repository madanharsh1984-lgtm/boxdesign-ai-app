// ─── BoxDesign AI — Axios API Client ─────────────────────────────────────────
import axios from 'axios';
import { API_BASE_URL, API_VERSION } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

let _token = '';

export function setAuthToken(token: string) {
  _token = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// ── Request interceptor: attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = _token || useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
