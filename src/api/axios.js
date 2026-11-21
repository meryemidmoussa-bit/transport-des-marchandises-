import axios from 'axios';
import mockAdapter from './mock';

// VITE_USE_MOCK=true : faux backend dans le navigateur
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  ...(useMock ? { adapter: mockAdapter } : {}),
});

// Ajoute le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;