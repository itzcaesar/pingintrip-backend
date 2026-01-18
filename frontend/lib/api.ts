import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Attempt refresh token (basic implementation)
            // For now, simpler to just logout on 401 for this iteration 
            // unless we want to implement full refresh flow in frontend.
            // Given the backend has refresh endpoint, we SHOULD do it, 
            // but let's stick to basic logout first to get things running.

            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        }

        return Promise.reject(error);
    }
);

export default api;
