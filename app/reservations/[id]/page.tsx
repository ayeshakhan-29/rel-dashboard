'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    MapPin,
    Calendar,
    Clock,
    Car,
    DollarSign,
    CreditCard,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
    Phone,
    Mail,
    UserPlus,
    MoreVertical
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AdminRoute from '@/app/components/auth/AdminRoute';
import reservationService from '@/app/services/reservationService';
import { Reservation } from '@/types/reservation.types';
import TripStatusLog from '@/components/TripStatusLog';

export default function ReservationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showActions, setShowActions] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (showActions && !(event.target as Element).closest('.actions-dropdown')) {
            setShowActions(false);
        }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showActions]);

    useEffect(() => {
        fetchReservation();
    }, [id]);

    const fetchReservation = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reservationService.getReservationById(id);
            setReservation(data);
        } catch (error: any) {
            console.error('Failed to fetch reservation:', error);
            setError(error.response?.data?.message || 'Failed to load reservation');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!reservation) return;
        
        setUpdating(true);
        try {
            await reservationService.updateStatus(id, status);
            await fetchReservation();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
            setShowActions(false);
        }
    };

    const handleCancel = async () => {
        if (!reservation) return;
        
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        
        setUpdating(true);
        try {
            await reservationService.cancelReservation(id);
            await fetchReservation();
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
            'assigned': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Car, label: 'Assigned' },
            'in_progress': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Car, label: 'On Trip' },
            'completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-4 w-4 mr-2" />
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status: string | undefined) => {
        const key = (status || 'pending').toLowerCase();
        const config: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            paid: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
            refunded: 'bg-slate-100 text-slate-700'
        };
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config[key] ?? 'bg-slate-100 text-slate-600'}`}>
                {label}
            </span>
        );
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

    if (error || !reservation) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Reservation</h2>
                        <p className="text-slate-600 mb-6">{error || 'Reservation not found'}</p>
                        <Link
                            href="/reservations"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reservations
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AdminRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title={`Reservation #${reservation.reservation_number}`} onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Header Actions */}
                            <div className="flex justify-end mb-6 space-x-3">
                                <Link
                                    href={`/reservations/${id}/edit`}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                                <div className="relative  actions-dropdown">
                                    <button
                                        onClick={() => setShowActions(!showActions)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                    
                                    {showActions && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                            <button
                                                onClick={() => handleStatusUpdate('assigned')}
                                                disabled={reservation.reservation_status !== 'pending'}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Mark as Assigned
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate('in_progress')}
                                                disabled={reservation.reservation_status !== 'assigned'}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Mark as On Trip
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate('completed')}
                                                disabled={reservation.reservation_status !== 'in_progress'}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Mark as Completed
                                            </button>
                                            <div className="border-t border-slate-200 my-1"></div>
                                            <button
                                                onClick={handleCancel}
                                                disabled={reservation.reservation_status === 'completed' || reservation.reservation_status === 'cancelled'}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cancel Reservation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Main Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Status Badge */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        {getStatusBadge(reservation.reservation_status)}
                                        <span className="text-sm text-slate-500">
                                            Created on {new Date(reservation.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Passenger Information */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <User className="h-5 w-5 mr-2 text-emerald-600" />
                                            Passenger Information
                                        </h2>
                                        <div className="flex items-start">
                                            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-lg font-medium text-slate-900">
                                                    {reservation.passenger_name}
                                                </h3>
                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                                                        {reservation.passenger_email}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                                                        {reservation.passenger_phone}
                                                    </div>
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
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-500">Pickup Location</p>
                                                    <p className="text-base text-slate-900">{reservation.pickup_location}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start">
                                                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                                    <MapPin className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-500">Dropoff Location</p>
                                                    <p className="text-base text-slate-900">{reservation.dropoff_location}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Pickup Date & Time</p>
                                                    <p className="text-base text-slate-900">
                                                        {new Date(reservation.pickup_date).toLocaleDateString()} at {reservation.pickup_time}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Passengers / Luggage</p>
                                                    <p className="text-base text-slate-900">
                                                        {reservation.passenger_count} passengers • {reservation.luggage_count} luggage
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle & Assignment */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <Car className="h-5 w-5 mr-2 text-emerald-600" />
                                            Vehicle & Assignment
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Vehicle Type</p>
                                                <p className="text-base text-slate-900">{reservation.vehicle_type || `ID: ${reservation.vehicle_type_id}`}</p>
                                                {reservation.vehicle_code && (
                                                    <p className="text-sm text-slate-500">Code: {reservation.vehicle_code}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Driver</p>
                                                {reservation.assigned_driver_id ? (
                                                    <>
                                                        <p className="text-base text-slate-900">{reservation.driver_name || 'Driver assigned'}</p>
                                                        {reservation.driver_phone && (
                                                            <p className="text-sm text-slate-500">{reservation.driver_phone}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-base text-slate-400">Not assigned yet</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status History */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                                            Status History
                                        </h2>
                                        <TripStatusLog reservationId={reservation.id} />
                                    </div>
                                </div>

                                {/* Right Column - Billing & Status */}
                                <div className="space-y-6">
                                    {/* Billing Information */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                                            Billing Information
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                <span className="text-sm text-slate-500">Trip Price</span>
                                                <span className="text-lg font-semibold text-slate-900">${reservation.price}</span>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm font-medium text-slate-500 mb-2">Payment Status</p>
                                                {getPaymentStatusBadge(reservation.payment_status)}
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-slate-500 mb-2">Booking Type</p>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                                                    {reservation.booking_type.charAt(0).toUpperCase() + reservation.booking_type.slice(1)}
                                                    {reservation.booking_type === 'form' && (
                                                        <span className="ml-2 text-xs text-slate-500">(Stripe)</span>
                                                    )}
                                                </span>
                                            </div>

                                            {reservation.booking_type === 'form' && reservation.form_booking_ref && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 mb-2">Form / Stripe ref</p>
                                                    <p className="text-xs font-mono text-slate-800 break-all">{reservation.form_booking_ref}</p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-sm font-medium text-slate-500 mb-2">Trip Type</p>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                                                    {reservation.trip_type.charAt(0).toUpperCase() + reservation.trip_type.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contract Details (if applicable) */}
                                    {reservation.booking_type === 'contract' && (
                                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                                <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                                                Contract Details
                                            </h2>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Contract Period</p>
                                                    <p className="text-base text-slate-900">
                                                        {reservation.contract_start_date ? new Date(reservation.contract_start_date).toLocaleDateString() : 'N/A'} - {reservation.contract_end_date ? new Date(reservation.contract_end_date).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                
                                                {reservation.daily_rate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-slate-500">Daily Rate</span>
                                                        <span className="text-sm font-medium text-slate-900">${reservation.daily_rate}/day</span>
                                                    </div>
                                                )}
                                                
                                                {reservation.hourly_rate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-slate-500">Hourly Rate</span>
                                                        <span className="text-sm font-medium text-slate-900">${reservation.hourly_rate}/hour</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                                        
                                        <div className="space-y-3">
                                            <Link
                                                href={`/dispatch/assign?reservation=${reservation.id}`}
                                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Assign Driver
                                            </Link>
                                            
                                            <Link
                                                href={`/reservations/${id}/edit`}
                                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Reservation
                                            </Link>
                                            
                                            {reservation.reservation_status !== 'cancelled' && reservation.reservation_status !== 'completed' && (
                                                <button
                                                    onClick={handleCancel}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancel Reservation
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}