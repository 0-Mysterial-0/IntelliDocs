import axios from 'axios';
import { mockData } from '@/data/mockData';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - inject JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — just pass errors through.
// Pages have their own catch blocks with demo fallbacks.
// Forced logout from here was firing BEFORE page catch blocks could run.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);


export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: Record<string, string>) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// Documents API
export const documentsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get('/documents', { params }),
  get: (id: string) => api.get(`/documents/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  favorite: (id: string) => api.post(`/documents/${id}/favorite`),
  archive: (id: string) => api.post(`/documents/${id}/archive`),
  restore: (id: string) => api.post(`/documents/${id}/restore`),
  getVersions: (id: string) => api.get(`/documents/${id}/versions`),
  getComments: (id: string) => api.get(`/documents/${id}/comments`),
  addComment: (id: string, content: string, parentId?: string) =>
    api.post(`/documents/${id}/comments`, { content, parent_id: parentId }),
};

// Upload API
export const uploadApi = {
  upload: (files: File[], metadata: Record<string, string>) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    Object.entries(metadata).forEach(([k, v]) => formData.append(k, v));
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStatus: (taskId: string) => api.get(`/upload/${taskId}/status`),
};

// OCR API
export const ocrApi = {
  getResult: (documentId: string) => api.get(`/ocr/${documentId}`),
};

// Analytics API
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  uploads: () => api.get('/analytics/uploads'),
  storage: () => api.get('/analytics/storage'),
};

// Approvals API
export const approvalsApi = {
  list: () => api.get('/approvals'),
  create: (data: Record<string, string>) => api.post('/approvals', data),
  approve: (id: string, comments?: string) =>
    api.put(`/approvals/${id}/approve`, { comments }),
  reject: (id: string, comments?: string) =>
    api.put(`/approvals/${id}/reject`, { comments }),
  requestChanges: (id: string, comments?: string) =>
    api.put(`/approvals/${id}/request-changes`, { comments }),
};

// Search API
export const searchApi = {
  semantic: (query: string, n_results?: number, filters?: Record<string, string>) =>
    api.post('/search/semantic', { query, n_results, filters }),
  history: () => api.get('/search/history'),
};

// Chat API
export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/chat/message', { message, session_id: sessionId }),
  getHistory: (sessionId: string) => api.get(`/chat/history/${sessionId}`),
  clearHistory: (sessionId: string) => api.delete(`/chat/history/${sessionId}`),
};

// Notifications API
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Users API
export const usersApi = {
  list: () => api.get('/users'),
  create: (data: Record<string, string>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
};

// Departments API
export const departmentsApi = {
  list: () => api.get('/departments'),
  create: (data: Record<string, string>) => api.post('/departments', data),
  update: (id: string, data: Record<string, string>) => api.put(`/departments/${id}`, data),
};

// Settings API
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: Record<string, unknown>) => api.put('/settings', data),
};
