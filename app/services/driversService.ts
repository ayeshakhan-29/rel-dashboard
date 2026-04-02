import api from './api';

export interface Driver {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone?: string | null;
    license_number: string | null;
    license_expiry: string | null;
    vehicle_id: number | null;
    status: 'available' | 'on_trip' | 'off_duty' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface RegisterDriverData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    licenseNumber: string;
    licenseExpiry?: string;
    vehicleId?: string;
}

export interface UpdateDriverData {
    name?: string;
    phone?: string;
    license_number?: string;
    license_expiry?: string;
    vehicle_id?: number | null;
    status?: 'available' | 'on_trip' | 'off_duty' | 'inactive';
}

export const getDrivers = async () => {
    const response = await api.get('/drivers');
    return response.data;
};

export const registerDriver = async (data: RegisterDriverData) => {
    const response = await api.post('/drivers', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        license_number: data.licenseNumber,
        license_expiry: data.licenseExpiry || null,
        vehicle_id: data.vehicleId ? parseInt(data.vehicleId, 10) : null
    });

    return response.data;
};

export const deleteDriver = async (driverId: number) => {
    const response = await api.delete(`/drivers/${driverId}`);
    return response.data;
};

export const updateDriver = async (driverId: number, data: UpdateDriverData) => {
    const response = await api.put(`/drivers/${driverId}`, data);
    return response.data;
};
