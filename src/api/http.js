import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_KEY } from '../constants';

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach token
http.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

// Response interceptor — handle 401, refresh token
http.interceptors.response.use(
  res => res.data,
  async err => {
    const original = err.config;
    // Manejar tanto 401 (Unauthorized) como 403 (Forbidden usado por Spring Security
    // cuando no hay AuthenticationEntryPoint configurado).
    // Con el fix del backend (AuthenticationEntryPoint que devuelve 401), el 403 aquí
    // solo será por permisos reales, no por token expirado. Pero se mantiene como fallback.
    const isAuthError = (err.response?.status === 401 || err.response?.status === 403) && !original._retry;
    if (isAuthError) {
      original._retry = true;
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refresh });
          const { accessToken } = res.data.data;
          localStorage.setItem(TOKEN_KEY, accessToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return http(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        // Sin refresh token: rechazar normalmente para que el catch del componente lo maneje
        return Promise.reject(err.response?.data || err);
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default http;
