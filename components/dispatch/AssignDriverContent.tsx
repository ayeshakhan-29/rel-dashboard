'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Car,
    User,
    MapPin,
    Calendar,
    Clock,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    UserPlus
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import reservationService from '@/app/services/reservationService';
import { Reservation, Driver } from '@/types/reservation.types';

export default function AssignDriverContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reservationId = parseInt(searchParams.get('reservation') || '0');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (reservationId) {
            fetchReservation();
            fetchDrivers();
        } else {
            setError('No reservation specified');
            setLoading(false);
        }
    }, [reservationId]);

    const fetchReservation = async () => {
        try {
            const data = await reservationService.getReservationById(reservationId);
            if (data.reservation_status !== 'pending') {
                setError(`Cannot assign driver. Reservation status is ${data.reservation_status}`);
            }
            setReservation(data);
        } catch (err) {
            setError('Failed to load reservation');
            console.error(err);
        }
    };

    const fetchDrivers = async () => {
        try {
            const data = await reservationService.getAvailableDrivers();
            setDrivers(data);
        } catch (err) {
            console.error('Failed to fetch drivers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedDriverId) {
            alert('Please select a driver');
            return;
        }

        setSubmitting(true);
        try {
            await reservationService.assignDriver(reservationId, selectedDriverId);
            setSuccess(true);
            setTimeout(() => {
                router.push(`/reservations/${reservationId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign driver');
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
                    <Header title="Assign Driver" onMenuClick={() => setSidebarOpen(true)} />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Driver Assigned!</h2>
                            <p className="text-slate-600 mb-6">Driver has been assigned successfully.</p>
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

    if (!reservation) {
        return (
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Assign Driver" onMenuClick={() => setSidebarOpen(true)} />
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
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
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Assign Driver" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Link
                                href={`/reservations/${reservationId}`}
                                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Reservation
                            </Link>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Reservation Summary */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                <Car className="h-5 w-5 mr-2 text-emerald-600" />
                                Reservation Details
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Reservation #</p>
                                    <p className="font-medium text-slate-900">{reservation.reservation_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                        {reservation.reservation_status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Passenger</p>
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-900">{reservation.passenger_name}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Contact</p>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-900">{reservation.passenger_phone}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-slate-500">Trip</p>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-slate-900">{reservation.pickup_location}</p>
                                            <p className="text-slate-500 text-sm">→ {reservation.dropoff_location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Date & Time</p>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-900">
                                            {new Date(reservation.pickup_date).toLocaleDateString()} at {reservation.pickup_time}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Vehicle Type</p>
                                    <p className="text-slate-900">{reservation.vehicle_type || `Vehicle #${reservation.vehicle_type_id}`}</p>
                                </div>
                            </div>
                        </div>

                        {/* Select Driver */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                <UserPlus className="h-5 w-5 mr-2 text-emerald-600" />
                                Select Driver
                            </h2>

                            {drivers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No drivers available at the moment</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {drivers.map((driver) => (
                                        <label
                                            key={driver.id}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                                                selectedDriverId === driver.id
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-slate-200 hover:border-emerald-300'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{driver.name}</p>
                                                    <p className="text-sm text-slate-500">Available</p>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="driver"
                                                value={driver.id}
                                                checked={selectedDriverId === driver.id}
                                                onChange={() => setSelectedDriverId(driver.id)}
                                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                                <Link
                                    href={`/reservations/${reservationId}`}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    onClick={handleAssign}
                                    disabled={submitting || !selectedDriverId || drivers.length === 0}
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Assigning...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            <span>Assign Driver</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}