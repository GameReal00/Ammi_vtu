import axios from 'axios';

console.log('API URL:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
          const res = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return axios(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
