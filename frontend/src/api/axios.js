import axios from 'axios';

const BACKEND_URL = import.meta.env.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15s timeout for slower mobile networks
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — log errors clearly for debugging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Network Error: Backend unreachable. Check VITE_BACKEND_URL:', BACKEND_URL);
        }
        return Promise.reject(error);
    }
);

export default api;
