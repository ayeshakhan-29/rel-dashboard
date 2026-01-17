import api from './api';

export interface Booking {
    id: string;
    created_at: string; // or Date if transformed
    distance: string;
    dropoffLocation: string;
    // dropoffLocationCoords: string; // JSON string
    email: string;
    fullName: string;
    luggageCount: string;
    numberOfHours: string;
    numberOfPassengers: string;
    phone: string;
    pickupDate: string;
    pickupLocation: string;
    // pickupLocationCoords: string; // JSON string
    pickupTime: string;
    refreshments: boolean;
    [key: string]: any;
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
