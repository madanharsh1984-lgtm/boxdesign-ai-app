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

// ── Request interceptor: attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
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
