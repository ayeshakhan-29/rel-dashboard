import api from './api';

export interface Booking {
    id: string;
    booking_ref: string;
    service_class: string;
    event_type: string;
    hours: number;
    vehicle_type: string;
    pickup_location: string;
    dropoff_location: string;
    pickup_date: string;
    pickup_time: string;
    passengers: number;
    full_name: string;
    email: string;
    phone: string;
    total_amount: number;
    status: string;
    created_at: string;
    [key: string]: any;
}

export interface Vehicle {
    id?: number;
    slug: string;
    label: string;
    passenger_capacity: number;
    luggage_capacity: number;
    description: string;
    features: string[];
    is_active: boolean;
    sort_order: number;
    base_rate?: number;
    per_mile?: number;
    per_hour?: number;
    per_minute?: number;
    pricing?: {
        base_rate: number;
        per_mile: number;
        per_hour: number;
        per_minute: number;
    };
    service_classes?: string[];
}

export interface RateConfig {
    id: number;
    tax_rate: number;
    cc_fee_rate: number;
    gratuity_rate: number;
    service_multipliers: {
        hourly: number;
        airport: number;
        event: number;
        corporate: number;
        [key: string]: number;
    };
    enabled_service_types: string[];
}

export const getBookings = async (): Promise<Booking[]> => {
    try {
        const response = await api.get('/forms/bookings');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const getBookingById = async (id: string): Promise<Booking> => {
    try {
        const response = await api.get(`/forms/bookings/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching booking ${id}:`, error);
        throw error;
    }
};

export const getVehicles = async (): Promise<Vehicle[]> => {
    try {
        const response = await api.get('/forms/vehicles');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
    }
};

export const getRateConfig = async (): Promise<RateConfig> => {
    try {
        const response = await api.get('/forms/rate-config');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching rate config:', error);
        throw error;
    }
};

export const saveVehicle = async (vehicleData: any): Promise<any> => {
    try {
        const response = vehicleData.id 
            ? await api.put(`/forms/vehicles/${vehicleData.id}`, vehicleData)
            : await api.post('/forms/vehicles', vehicleData);
        return response.data;
    } catch (error) {
        console.error('Error saving vehicle:', error);
        throw error;
    }
};

export const updateRateConfig = async (configData: any): Promise<any> => {
    try {
        const response = await api.put('/forms/rate-config', configData);
        return response.data;
    } catch (error) {
        console.error('Error updating rate config:', error);
        throw error;
    }
};
