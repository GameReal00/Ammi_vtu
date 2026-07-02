/**
 * Axios instance with automatic JWT refresh handling.
 * 
 * Handles network errors / Render cold-starts / transient 5xx).
 */
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Refresh de-duplication state ──
let isRefreshing = false;
let refreshQueue = [];

function onRefreshed(newToken) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

function forceLogout() {
  localStorage.clear();
  window.location.href = '/login';
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s, and only retry each request once
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in flight, queue this request behind it
    // instead of firing a second, competing refresh call.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
      const newAccess = res.data.access;

      localStorage.setItem('access_token', newAccess);
      // If the backend rotates refresh tokens, persist the new one too —
      // otherwise the NEXT refresh attempt uses a stale, already-invalidated token.
      if (res.data.refresh) {
        localStorage.setItem('refresh_token', res.data.refresh);
      }

      isRefreshing = false;
      onRefreshed(newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshed(null); // reject anything queued behind this refresh

      // Only wipe the session if the SERVER explicitly rejected the refresh
      // token (it's genuinely expired/invalid). A network error, timeout,
      // or 5xx (e.g. Render's free worker restarting) is NOT proof the
      // session is dead — don't punish the user for infrastructure hiccups.
      if (refreshError.response?.status === 401) {
        forceLogout();
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;