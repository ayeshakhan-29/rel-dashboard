import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'employee' | 'admin' | 'team' | 'driver' | 'passenger';
    created_at: string;
    updated_at: string;
}

export interface UpdateProfileData {
    name: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    user: User;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: 'employee' | 'admin' | 'team' | 'driver' | 'passenger';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: 'employee' | 'admin' | 'team' | 'driver' | 'passenger';
}

/**
 * Create a new user
 */
export const createUser = async (data: CreateUserData) => {
    const response = await api.post('/users', data);
    return response.data;
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

/**
 * Delete a user
 */
export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

/**
 * Update user profile (for self)
 */
export const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
    const response = await api.put('/users/profile', data);
    return response.data;
};

/**
 * Update any user by ID (for admin/management)
 */
export const updateUserById = async (id: number, data: UpdateUserData) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};