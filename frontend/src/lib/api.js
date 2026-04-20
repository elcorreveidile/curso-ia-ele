import axios from 'axios';

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND}/api`;

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lcd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
