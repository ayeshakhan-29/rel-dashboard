'use client';
import { Vehicle ,CreateReservationData} from '@/types/reservation.types';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    CreditCard,
    Save,
    X
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import reservationService from '@/app/services/reservationService';


export default function EditReservationPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
        payment_status: 'pending' as 'pending' | 'paid' | 'failed' | 'refunded',
        
        // Contract specific
        contract_start_date: '',
        contract_end_date: '',
        daily_rate: 0,
        hourly_rate: 0,
    });

    // Fetch reservation and vehicles
    useEffect(() => {
        fetchReservation();
        fetchVehicles();
    }, [id]);

    const fetchReservation = async () => {
        setLoading(true);
        try {
            const data = await reservationService.getReservationById(id);
            setFormData({
                booking_type: data.booking_type,
                trip_type: data.trip_type,
                passenger_id: data.passenger_id,
                passenger_name: data.passenger_name,
                passenger_email: data.passenger_email,
                passenger_phone: data.passenger_phone,
                pickup_location: data.pickup_location,
                dropoff_location: data.dropoff_location,
                pickup_date: data.pickup_date,
                pickup_time: data.pickup_time,
                vehicle_type_id: data.vehicle_type_id,
                passenger_count: data.passenger_count,
                luggage_count: data.luggage_count,
                price: data.price,
                payment_status: data.payment_status,
                contract_start_date: data.contract_start_date || '',
                contract_end_date: data.contract_end_date || '',
                daily_rate: data.daily_rate || 0,
                hourly_rate: data.hourly_rate || 0,
            });
        } catch (error) {
            console.error('Failed to fetch reservation:', error);
            setErrors({ submit: 'Failed to load reservation' });
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const data = await reservationService.getAvailableVehicles();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;
        if (name === 'vehicle_type_id' || name === 'passenger_count' || name === 'luggage_count' || 
            name === 'price' || name === 'daily_rate' || name === 'hourly_rate') {
            processedValue = value === '' ? 0 : Number(value);
        }
        
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
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
        if (!formData.vehicle_type_id || formData.vehicle_type_id === 0) newErrors.vehicle_type_id = 'Vehicle type is required';
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setSubmitting(true);
    try {
        // Format dates and ensure correct types
      const formattedData: Partial<CreateReservationData> = {
    ...formData,
    pickup_date: formData.pickup_date ? new Date(formData.pickup_date).toISOString().split('T')[0] : undefined,
    contract_start_date: formData.contract_start_date ? new Date(formData.contract_start_date).toISOString().split('T')[0] : undefined,
    contract_end_date: formData.contract_end_date ? new Date(formData.contract_end_date).toISOString().split('T')[0] : undefined,
    payment_status: formData.payment_status === 'paid' ? 'paid' : 'pending',
};
        
        await reservationService.updateReservation(id, formattedData);
        setSuccess(true);
        
        setTimeout(() => {
            router.push(`/reservations/${id}`);
        }, 2000);
    } catch (error: any) {
        console.error('Failed to update reservation:', error);
        setErrors({ submit: error.response?.data?.message || 'Failed to update reservation' });
    } finally {
        setSubmitting(false);
    }
};
    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Edit Reservation" onMenuClick={() => setSidebarOpen(true)} />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation Updated!</h2>
                            <p className="text-slate-600 mb-6">Your reservation has been updated successfully.</p>
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
                <Header title="Edit Reservation" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        {errors.submit && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{errors.submit}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Booking Type Display (Read-only) */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                                    Booking Type
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <span className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                                        {formData.booking_type === 'form' ? 'Form Booking' : 
                                         formData.booking_type === 'contract' ? 'Contract Booking' : 'Manual Entry'}
                                    </span>
                                    <span className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                                        {formData.trip_type === 'distance' ? 'Distance Based' : 
                                         formData.trip_type === 'hourly' ? 'Hourly' : 'Contract'}
                                    </span>
                                </div>
                            </div>

                            {/* Passenger Information */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                                    Passenger Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
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

                            {/* Pricing */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                                    Pricing
                                </h2>

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
                                                    Start Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        name="contract_start_date"
                                                        value={formData.contract_start_date}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    End Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        name="contract_end_date"
                                                        value={formData.contract_end_date}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Daily Rate ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="daily_rate"
                                                    value={formData.daily_rate}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Hourly Rate ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="hourly_rate"
                                                    value={formData.hourly_rate}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="mt-8 pt-4 border-t border-slate-200">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/reservations/${id}`)}
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
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    <span>Save Changes</span>
                                                </>
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