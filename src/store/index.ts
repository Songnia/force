import { create } from 'zustand';

type Role = 'patron' | 'vendeur';

interface AuthState {
    token: string | null;
    user: any | null;
    role: Role | null;
    setToken: (token: string | null) => void;
    setUser: (user: any | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token') || null,
    user: null,
    role: (localStorage.getItem('role') as Role) || null,
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        set({ token });
    },
    setUser: (user) => {
        if (user?.role) {
            localStorage.setItem('role', user.role);
        } else {
            localStorage.removeItem('role');
        }
        set({ user, role: user?.role ?? null });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        set({ token: null, user: null, role: null });
    },
}));
