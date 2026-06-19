import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL: API_URL });

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth calls
export const authApi = {
  register: (data: { name: string; email: string; password: string; workspaceName: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  me: () => api.post('/auth/me').then((r) => r.data),
};

// Flows calls
export const flowsApi = {
  list: () => api.get('/flows').then((r) => r.data),
  get: (id: string) => api.get(`/flows/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post('/flows', data).then((r) => r.data),
  update: (id: string, data: object) =>
    api.put(`/flows/${id}`, data).then((r) => r.data),
  execute: (id: string) =>
    api.post(`/flows/${id}/execute`).then((r) => r.data),
  remove: (id: string) => api.delete(`/flows/${id}`).then((r) => r.data),
};

// Templates calls
export const templatesApi = {
  list: (category?: string) =>
    api.get('/templates', { params: category ? { category } : {} }).then((r) => r.data),
  get: (id: string) => api.get(`/templates/${id}`).then((r) => r.data),
  use: (id: string) => api.post(`/templates/${id}/use`).then((r) => r.data),
};
