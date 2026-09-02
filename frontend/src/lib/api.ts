import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // 1. Direct token key (set on login)
  const direct = localStorage.getItem('token');
  if (direct) return direct;
  // 2. Fallback: Zustand persist storage (set on page-reload hydration)
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) return JSON.parse(raw)?.state?.token ?? null;
  } catch { /* ignore */ }
  return null;
};

const api = axios.create({ baseURL: BASE_URL });

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
// Backend: /api/auth
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  onboard: (data: any) =>
    api.post('/auth/onboard', data),
  me: () => api.get('/auth/me'),
};

// ─── Student ─────────────────────────────────────────────────────────────────
// Backend: /api/students
export const studentAPI = {
  dashboard: () => api.get('/students/dashboard'),
  updateProfile: (data: any) => api.put('/students/profile', data),
  getApplications: () => api.get('/students/applications'),
  updateApplication: (opportunityId: number, status: string) =>
    api.post('/students/applications', { opportunityId, status }),
  getSaved: () => api.get('/students/saved'),
  toggleSave: (opportunityId: number) =>
    api.post('/students/saved', { opportunityId }),
  getNotifications: () => api.get('/students/notifications'),
};

// ─── Opportunity ─────────────────────────────────────────────────────────────
// Backend: /api/opportunities
export const opportunityAPI = {
  list: (params?: { category?: string; mode?: string; search?: string; limit?: number }) =>
    api.get('/opportunities', { params }),
  byId: (id: number) => api.get(`/opportunities/${id}`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
// Backend: /api/ai
export const aiAPI = {
  careerRecommendation: (answers: Record<string, string>) =>
    api.post('/ai/career-recommendation', { answers }),
  skillGap: (careerId: number) =>
    api.post('/ai/skill-gap', { careerId }),
  careerRoadmap: (careerId: number) =>
    api.post('/ai/career-roadmap', { careerId }),
  opportunityMatch: () =>
    api.post('/ai/recommend-opportunities'),
  chatAdvice: (message: string) =>
    api.post('/ai/chat', { message }),
};

// ─── Counsellor ──────────────────────────────────────────────────────────────
// Backend: /api/counsellors
export const counsellorAPI = {
  list: (params?: any) => api.get('/counsellors', { params }),
  byId: (id: number) => api.get(`/counsellors/${id}`),
  book: (data: any) => api.post('/counsellors/book', data),
  dashboard: () => api.get('/counsellors/dashboard'),
  students: () => api.get('/counsellors/students'),
  studentReport: (studentId: number) => api.get(`/counsellors/students/${studentId}`),
  createReport: (data: any) => api.post('/counsellors/reports', data),
  availability: () => api.get('/counsellors/availability'),
  updateAvailability: (data: any) => api.put('/counsellors/availability', data),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
// Backend: /api/admin (check if exists, else fall back to counsellors admin routes)
export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  pendingCounsellors: () => api.get('/admin/counsellors/pending'),
  verifyCounsellor: (id: number, verify: boolean) =>
    api.patch(`/admin/counsellors/${id}/verify`, { isVerified: verify }),
};

// ─── Payment ─────────────────────────────────────────────────────────────────
// Backend: /api/payments
export const paymentAPI = {
  upgradePremium: () => api.post('/payments/upgrade'),
  history: () => api.get('/payments/history'),
};

export default api;
