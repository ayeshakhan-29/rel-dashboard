import { CreateReservationData, Driver, PaginatedResponse, Passenger, ReservationFilters, Vehicle } from '@/types/reservation.types';
import api from './api';
import { Reservation } from '@/types/reservation.types';

class ReservationService {
    /**
     * Create a new reservation
     */
    async createReservation(data: CreateReservationData): Promise<Reservation> {
        const response = await api.post('/reservations', data);
        return response.data.data;
    }

    /**
     * Get all reservations with filters
     */
    async getReservations(filters?: ReservationFilters): Promise<PaginatedResponse<Reservation>> {
        const response = await api.get('/reservations', { params: filters });
        return response.data;
    }

    /**
     * Get reservation by ID
     */
    async getReservationById(id: number): Promise<Reservation> {
        const response = await api.get(`/reservations/${id}`);
        return response.data.data;
    }

    /**
     * Update reservation
     */
    async updateReservation(id: number, data: Partial<CreateReservationData>): Promise<Reservation> {
        const response = await api.put(`/reservations/${id}`, data);
        return response.data.data;
    }

    /**
     * Assign driver to reservation
     */
    async assignDriver(reservationId: number, driverId: number): Promise<any> {
        const response = await api.post(`/reservations/${reservationId}/assign-driver`, { driver_id: driverId });
        return response.data.data;
    }

    /**
     * Update reservation status
     */
    async updateStatus(reservationId: number, status: string): Promise<any> {
        const response = await api.patch(`/reservations/${reservationId}/status`, { status });
        return response.data.data;
    }

    /**
     * Cancel reservation
     */
    async cancelReservation(reservationId: number): Promise<any> {
        const response = await api.post(`/reservations/${reservationId}/cancel`);
        return response.data.data;
    }

    /**
     * Get reservations by passenger
     */
    async getPassengerReservations(passengerId: number, page?: number, limit?: number): Promise<PaginatedResponse<Reservation>> {
        const response = await api.get(`/reservations/passenger/${passengerId}`, {
            params: { page, limit }
        });
        return response.data;
    }

    async getDriverTrips(params: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Reservation>> {
        const response = await api.get('/reservations/driver/trips', { params });
        return response.data;
    }

    async updateReservationStatus(id: number, status: string): Promise<Reservation> {
        const response = await api.patch(`/reservations/${id}/status`, { status });
        return response.data.data;
    }

    async getStatusLogs(reservationId: number): Promise<any[]> {
        const response = await api.get(`/reservations/${reservationId}/status-logs`);
        return response.data.data;
    }

    async getRecentActivity(limit = 10): Promise<any[]> {
        const response = await api.get('/reservations/activity/recent', { params: { limit } });
        return response.data.data;
    }

    /**
     * Get available vehicles
     */
    async getAvailableVehicles(): Promise<Vehicle[]> {
        const response = await api.get('/reservations/vehicles');
        return response.data.data;
    }

    /**
     * Get available drivers
     */
   async getAvailableDrivers(): Promise<Driver[]> {
    const response = await api.get('/reservations/drivers/available');
    return response.data.data;
}

    /**
     * Get reservation statistics
     */
    async getReservationStats(): Promise<any> {
        const response = await api.get('/reservations/stats');
        return response.data.data;
    }

    /**
     * Search passengers by name/email/phone
     */
    async searchPassengers(query: string): Promise<Passenger[]> {
        const response = await api.get('/users/passengers/search', {
            params: { q: query }
        });
        return response.data.data;
    }

    /**
     * Get recent form submissions (bookings with type 'form')
     */
    async getRecentFormSubmissions(limit: number = 5): Promise<Reservation[]> {
        const response = await api.get('/reservations', {
            params: {
                booking_type: 'form',
                limit: limit,
                page: 1
            }
        });
        return response.data.data;
    }

    async deleteReservation(id: number): Promise<void> {
        await api.delete(`/reservations/${id}`);
    }
}

export default new ReservationService();