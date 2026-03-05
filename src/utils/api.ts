import axios from 'axios';
import { useAuthStore } from '../store';

// Axios instance — utiliser l'URL de production si définie, sinon '/api' pour le proxy local
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Inject token automatically on every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirect to /login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: { nom: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/user'),
};

// ─── Articles ────────────────────────────────────────────────────────────────
export const articlesAPI = {
    list: () => api.get('/articles'),
    create: (data: any) => api.post('/articles', data),
    update: (id: number, data: any) => api.put(`/articles/${id}`, data),
    delete: (id: number) => api.delete(`/articles/${id}`),
};

// ─── Catégories ──────────────────────────────────────────────────────────────
export const categoriesAPI = {
    list: () => api.get('/categories'),
    create: (data: { nom: string; couleur?: string }) =>
        api.post('/categories', data),
    update: (id: number, data: any) => api.put(`/categories/${id}`, data),
    delete: (id: number) => api.delete(`/categories/${id}`),
};

// ─── Ventes ──────────────────────────────────────────────────────────────────
export const ventesAPI = {
    list: () => api.get('/ventes'),
    create: (data: any) => api.post('/ventes', data),
    show: (id: number) => api.get(`/ventes/${id}`),
};

// ─── Stocks ──────────────────────────────────────────────────────────────────
export const stocksAPI = {
    list: () => api.get('/mouvement-stocks'),
    create: (data: any) => api.post('/mouvement-stocks', data),
    update: (id: number, data: any) => api.put(`/mouvement-stocks/${id}`, data),
    delete: (id: number) => api.delete(`/mouvement-stocks/${id}`),
};

// ─── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardAPI = {
    getStats: (periode: string) => api.get(`/dashboard/stats?periode=${periode}`),
};

// ─── Crédits ─────────────────────────────────────────────────────────────────
export const creditsAPI = {
    list: () => api.get('/credits'),
    create: (data: any) => api.post('/credits', data),
    payer: (id: number, data: { montant: number; notes?: string }) =>
        api.post(`/credits/${id}/payer`, data),
};
