'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Car, 
    User, 
    MapPin, 
    Calendar, 
    Clock, 
    Users, 
    Luggage, 
    DollarSign,
    FileText,
    AlertCircle,
    CheckCircle,
    Loader2,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import reservationService from '@/app/services/reservationService';
import { Vehicle, Passenger } from '@/types/reservation.types';

export default function CreateReservationPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [showPassengerSearch, setShowPassengerSearch] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Booking Type
        booking_type: 'form' as 'form' | 'contract' | 'manual',
        trip_type: 'distance' as 'hourly' | 'distance' | 'contract',
        
        // Passenger Information
        passenger_id: 0,
        passenger_name: '',
        passenger_email: '',
        passenger_phone: '',
        
        // Trip Details
        pickup_location: '',
        dropoff_location: '',
        pickup_date: '',
        pickup_time: '',
        vehicle_type_id: 0,
        passenger_count: 1,
        luggage_count: 0,
        
        // Booking Details
        price: 0,
        payment_status: 'pending' as 'pending' | 'paid',
        
        // Contract specific
        contract_start_date: '',
        contract_end_date: '',
        daily_rate: 0,
        hourly_rate: 0,
    });

    // Fetch vehicles on mount
    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const data = await reservationService.getAvailableVehicles();
            console.log('Fetched vehicles:', data); // Debug log
            setVehicles(data);
            // Don't auto-select, let user choose
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchPassengers = async (query: string) => {
        if (query.length < 3) return;
        try {
            const results = await reservationService.searchPassengers(query);
            setPassengers(results);
            setShowPassengerSearch(true);
        } catch (error) {
            console.error('Failed to search passengers:', error);
        }
    };

    const selectPassenger = (passenger: Passenger) => {
        setFormData({
            ...formData,
            passenger_id: passenger.id,
            passenger_name: `${passenger.first_name} ${passenger.last_name}`,
            passenger_email: passenger.email,
            passenger_phone: passenger.phone
        });
        setShowPassengerSearch(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;
        
        // Handle number fields
        if (name === 'vehicle_type_id') {
            processedValue = value === '' ? 0 : Number(value);
            console.log('Selected vehicle ID:', processedValue); // Debug log
        }
        
        if (name === 'passenger_count' || name === 'luggage_count' || 
            name === 'price' || name === 'daily_rate' || name === 'hourly_rate') {
            processedValue = value === '' ? 0 : Number(value);
        }
        
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Search passengers when typing name
        if (name === 'passenger_name' && value.length >= 3) {
            searchPassengers(value);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.passenger_name) newErrors.passenger_name = 'Passenger name is required';
        if (!formData.passenger_email) newErrors.passenger_email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.passenger_email)) newErrors.passenger_email = 'Invalid email format';
        
        if (!formData.passenger_phone) newErrors.passenger_phone = 'Phone is required';
        if (!formData.pickup_location) newErrors.pickup_location = 'Pickup location is required';
        if (!formData.dropoff_location) newErrors.dropoff_location = 'Dropoff location is required';
        if (!formData.pickup_date) newErrors.pickup_date = 'Pickup date is required';
        if (!formData.pickup_time) newErrors.pickup_time = 'Pickup time is required';
        if (!formData.vehicle_type_id || formData.vehicle_type_id === 0) {
            newErrors.vehicle_type_id = 'Vehicle type is required';
        }
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';

        // Contract validations
        if (formData.booking_type === 'contract') {
            if (!formData.contract_start_date) newErrors.contract_start_date = 'Contract start date is required';
            if (!formData.contract_end_date) newErrors.contract_end_date = 'Contract end date is required';
            if (formData.contract_start_date && formData.contract_end_date) {
                if (new Date(formData.contract_end_date) < new Date(formData.contract_start_date)) {
                    newErrors.contract_end_date = 'End date must be after start date';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('Submitting form data:', formData); // Debug log
        
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSubmitting(true);
        try {
            const reservation = await reservationService.createReservation(formData);
            setSuccess(true);
            
            setTimeout(() => {
                router.push(`/reservations/${reservation.id}`);
            }, 2000);
        } catch (error: any) {
            console.error('Failed to create reservation:', error);
            setErrors({ submit: error.response?.data?.message || 'Failed to create reservation' });
        } finally {
            setSubmitting(false);
        }
    };

    const calculateEstimatedPrice = (): number => {
        try {
            const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_type_id);
            if (!selectedVehicle) return 0;

            let estimatedPrice = 0;

            if (formData.trip_type === 'hourly') {
                const hours = Number(formData.hourly_rate) || 1;
                const hourlyRate = Number(selectedVehicle.hourly_rate) || 50;
                estimatedPrice = hourlyRate * hours;
            } else if (formData.trip_type === 'distance') {
                const baseFare = Number(selectedVehicle.base_fare) || 25;
                const perMileRate = Number(selectedVehicle.per_mile_rate) || 2.5;
                const miles = 10;
                estimatedPrice = baseFare + (perMileRate * miles);
            } else {
                estimatedPrice = Number(selectedVehicle.hourly_rate) || 50;
            }

            const passengerCount = Number(formData.passenger_count) || 1;
            const luggageCount = Number(formData.luggage_count) || 0;
            
            estimatedPrice += (passengerCount - 1) * 5;
            estimatedPrice += luggageCount * 3;

            return Math.round(estimatedPrice * 100) / 100;
        } catch (error) {
            console.error('Error calculating price:', error);
            return 0;
        }
    };

    const estimatedPrice = calculateEstimatedPrice();

    if (success) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Create Reservation" onMenuClick={() => setSidebarOpen(true)} />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation Created!</h2>
                            <p className="text-slate-600 mb-6">Your reservation has been created successfully.</p>
                            <p className="text-sm text-slate-500">Redirecting to reservation details...</p>
                            <div className="mt-6 flex justify-center">
                                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Create New Reservation" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        {errors.submit && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{errors.submit}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Booking Type Selection */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                                    Booking Type
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.booking_type === 'form' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="booking_type"
                                            value="form"
                                            checked={formData.booking_type === 'form'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">Form Booking</p>
                                            <p className="text-xs text-slate-500">Standard web form booking</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.booking_type === 'manual' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="booking_type"
                                            value="manual"
                                            checked={formData.booking_type === 'manual'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">Manual Entry</p>
                                            <p className="text-xs text-slate-500">Created by operations team</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.booking_type === 'contract' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="booking_type"
                                            value="contract"
                                            checked={formData.booking_type === 'contract'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">Contract Booking</p>
                                            <p className="text-xs text-slate-500">Long-term / multi-day</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Passenger Information */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                                    Passenger Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="passenger_name"
                                                value={formData.passenger_name}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.passenger_name ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                                placeholder="Enter passenger name"
                                            />
                                        </div>
                                        {errors.passenger_name && (
                                            <p className="mt-1 text-xs text-red-600">{errors.passenger_name}</p>
                                        )}
                                        
                                        {showPassengerSearch && passengers.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {passengers.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => selectPassenger(p)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b last:border-b-0"
                                                    >
                                                        <p className="font-medium text-slate-900">{p.first_name} {p.last_name}</p>
                                                        <p className="text-xs text-slate-500">{p.email} • {p.phone}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                name="passenger_email"
                                                value={formData.passenger_email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.passenger_email ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                                placeholder="passenger@example.com"
                                            />
                                        </div>
                                        {errors.passenger_email && (
                                            <p className="mt-1 text-xs text-red-600">{errors.passenger_email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                name="passenger_phone"
                                                value={formData.passenger_phone}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.passenger_phone ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                                placeholder="+1 (234) 567-8900"
                                            />
                                        </div>
                                        {errors.passenger_phone && (
                                            <p className="mt-1 text-xs text-red-600">{errors.passenger_phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Passenger Count
                                        </label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="number"
                                                name="passenger_count"
                                                value={formData.passenger_count}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="20"
                                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                                    Trip Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pickup Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="pickup_location"
                                                value={formData.pickup_location}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.pickup_location ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                                placeholder="Enter pickup address"
                                            />
                                        </div>
                                        {errors.pickup_location && (
                                            <p className="mt-1 text-xs text-red-600">{errors.pickup_location}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Dropoff Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="dropoff_location"
                                                value={formData.dropoff_location}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.dropoff_location ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                                placeholder="Enter dropoff address"
                                            />
                                        </div>
                                        {errors.dropoff_location && (
                                            <p className="mt-1 text-xs text-red-600">{errors.dropoff_location}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pickup Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="date"
                                                name="pickup_date"
                                                value={formData.pickup_date}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.pickup_date ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.pickup_date && (
                                            <p className="mt-1 text-xs text-red-600">{errors.pickup_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pickup Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="time"
                                                name="pickup_time"
                                                value={formData.pickup_time}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.pickup_time ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                            />
                                        </div>
                                        {errors.pickup_time && (
                                            <p className="mt-1 text-xs text-red-600">{errors.pickup_time}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Vehicle Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                name="vehicle_type_id"
                                                value={formData.vehicle_type_id || ''}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.vehicle_type_id ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                            >
                                                <option value="">Select a vehicle</option>
                                                {vehicles.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.vehicle_type} - {v.vehicle_code} (Capacity: {v.passenger_capacity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.vehicle_type_id && (
                                            <p className="mt-1 text-xs text-red-600">{errors.vehicle_type_id}</p>
                                        )}
                                        {vehicles.length === 0 && !loading && (
                                            <p className="mt-1 text-xs text-amber-600">No vehicles available. Please contact admin.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Luggage Count
                                        </label>
                                        <div className="relative">
                                            <Luggage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="number"
                                                name="luggage_count"
                                                value={formData.luggage_count}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="10"
                                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Type & Pricing */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                                    Trip Type & Pricing
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.trip_type === 'distance' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="trip_type"
                                            value="distance"
                                            checked={formData.trip_type === 'distance'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">Distance Based</p>
                                            <p className="text-xs text-slate-500">Pay per mile/km</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.trip_type === 'hourly' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="trip_type"
                                            value="hourly"
                                            checked={formData.trip_type === 'hourly'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">Hourly</p>
                                            <p className="text-xs text-slate-500">Pay per hour</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.trip_type === 'contract' 
                                            ? 'border-emerald-500 bg-emerald-50' 
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="trip_type"
                                            value="contract"
                                            checked={formData.trip_type === 'contract'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">Contract</p>
                                            <p className="text-xs text-slate-500">Multi-day rate</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Price ($) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                    errors.price ? 'border-red-500' : 'border-slate-300'
                                                }`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                                        )}
                                        {formData.vehicle_type_id !== 0 && vehicles.length > 0 && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                Estimated: ${estimatedPrice.toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Payment Status
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                name="payment_status"
                                                value={formData.payment_status}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contract fields */}
                                {formData.booking_type === 'contract' && (
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h3 className="text-md font-medium text-slate-900 mb-4">Contract Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Start Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        name="contract_start_date"
                                                        value={formData.contract_start_date}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                            errors.contract_start_date ? 'border-red-500' : 'border-slate-300'
                                                        }`}
                                                    />
                                                </div>
                                                {errors.contract_start_date && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contract_start_date}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    End Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        name="contract_end_date"
                                                        value={formData.contract_end_date}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                                            errors.contract_end_date ? 'border-red-500' : 'border-slate-300'
                                                        }`}
                                                    />
                                                </div>
                                                {errors.contract_end_date && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.contract_end_date}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Daily Rate ($)
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        name="daily_rate"
                                                        value={formData.daily_rate}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Hourly Rate ($)
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        name="hourly_rate"
                                                        value={formData.hourly_rate}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="mt-8 pt-4 border-t border-slate-200">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/reservations')}
                                            className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Creating...</span>
                                                </>
                                            ) : (
                                                <span>Create Reservation</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}