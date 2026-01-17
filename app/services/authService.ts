import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
}

export interface LoginData {
    email: string;
    password: string;
}

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

/**
 * Get authenticated user profile
 */
export const getMe = async (): Promise<{ success: boolean; message: string; data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (refreshToken: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<{ success: boolean; message: string; data: { accessToken: string } }> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
};

const authService = {
    register,
    login,
    getMe,
    logout,
    refreshToken,
};

export default authService;
