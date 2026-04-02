export interface Reservation {
    id: number;
    reservation_number: string;
    booking_type: 'form' | 'contract' | 'manual';
    trip_type: 'hourly' | 'distance' | 'contract';
    
    // Passenger Information
    passenger_id: number;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;
    
    // Trip Details
    pickup_location: string;
    dropoff_location: string;
    pickup_date: string;
    pickup_time: string;
    vehicle_type_id: number;
    passenger_count: number;
    luggage_count: number | null;
    
    // Booking Details
    price: number | null;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    reservation_status: 'pending' | 'assigned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'pending_driver_approval' | 'driver_denied';
    
    // Assignment
    assigned_driver_id: number | null;
    assigned_vehicle_id: number | null;
    driver_name?: string;
    driver_phone?: string;
    
    // Vehicle Details
    vehicle_type?: string;
    vehicle_code?: string;
    vehicle_image?: string;
    
    // Contract specific
    contract_start_date?: string | null;
    contract_end_date?: string | null;
    daily_rate?: number | null;
    hourly_rate?: number | null;
    
    // Metadata
    created_by?: number;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: number;
    vehicle_code: string;
    vehicle_type: string;
    passenger_capacity: number;
    luggage_capacity: number;
    description: string;
    hourly_rate: number;
    base_fare: number;
    per_mile_rate: number;
    image_url?: string;
    is_active: boolean;
}

export interface Driver {
    id: number;
    user_id: number;
    name: string;
    phone?: string;
    license_number?: string;
    status: 'available' | 'on_trip' | 'off_duty' | 'inactive';
    vehicle_id?: number;
}

export interface Passenger {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export interface CreateReservationData {
    booking_type: 'form' | 'contract' | 'manual';
    trip_type: 'hourly' | 'distance' | 'contract';
    passenger_id: number;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;
    pickup_location: string;
    dropoff_location: string;
    pickup_date: string;
    pickup_time: string;
    vehicle_type_id: number;
    passenger_count: number;
    luggage_count: number | null;
    price: number | null;
    payment_status?: 'pending' | 'paid';
    contract_start_date?: string;
    contract_end_date?: string;
    daily_rate?: number;
    hourly_rate?: number;
}

export interface ReservationFilters {
    page?: number;
    limit?: number;
    status?: string;
    booking_type?: string;
    passenger_id?: number;
    driver_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}