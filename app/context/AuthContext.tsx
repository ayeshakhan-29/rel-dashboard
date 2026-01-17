'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, RegisterData, LoginData } from '../services/authService';

type ApiError = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: User) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    /**
     * Load authenticated user from API
     */
    const loadUser = async () => {
        try {
            const accessToken = sessionStorage.getItem('accessToken');

            if (!accessToken) {
                setLoading(false);
                return;
            }

            const response = await authService.getMe();
            setUser(response.data.user);
            setError(null);
        } catch (err: unknown) {
            console.error('Failed to load user:', err);
            // Clear tokens if user fetch fails
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login user
     */
    const login = async (data: LoginData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.login(data);

            // Store tokens in sessionStorage (clears when browser closes)
            sessionStorage.setItem('accessToken', response.data.accessToken);
            sessionStorage.setItem('refreshToken', response.data.refreshToken);

            // Set user
            setUser(response.data.user);
        } catch (err: unknown) {
            const errorMessage = (err as ApiError).response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Register new user
     */
    const register = async (data: RegisterData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.register(data);

            // Store tokens in sessionStorage (clears when browser closes)
            sessionStorage.setItem('accessToken', response.data.accessToken);
            sessionStorage.setItem('refreshToken', response.data.refreshToken);

            // Set user
            setUser(response.data.user);
        } catch (err: unknown) {
            const errorMessage = (err as ApiError).response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            const refreshToken = sessionStorage.getItem('refreshToken');

            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear tokens and user state
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setUser(null);
            setError(null);
        }
    };

    /**
     * Update user data
     */
    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
