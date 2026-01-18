import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    setAuth: (user: User, accessToken: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            setAuth: (user, accessToken) => {
                localStorage.setItem('accessToken', accessToken); // Sync for axios
                set({ user, accessToken });
            },
            logout: () => {
                localStorage.removeItem('accessToken');
                set({ user: null, accessToken: null });
            },
            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'auth-storage',
        }
    )
);
