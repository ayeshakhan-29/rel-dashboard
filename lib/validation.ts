// Centralized validation utilities

export const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
        return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
};

export const validatePassword = (password: string, minLength: number = 6): string | null => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters`;
    }
    return null;
};

export const validateStrongPassword = (password: string): string | null => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
};

export const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
        return 'Phone number is required';
    }
    if (!/^[\d\s\+\-\(\)]+$/.test(phone)) {
        return 'Please enter a valid phone number';
    }
    return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) {
        return `${fieldName} is required`;
    }
    return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return null;
};