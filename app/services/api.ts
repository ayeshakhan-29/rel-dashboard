import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - Attach access token to requests
api.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh on 401
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't intercept 401s for login/register requests
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const refreshToken = sessionStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // No refresh token, redirect to login
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');

                    // Only redirect if not already on the login page to avoid reloads
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
                    { refreshToken }
                );

                const { accessToken } = response.data.data;

                // Store new access token
                sessionStorage.setItem('accessToken', accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
