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
    const [allReservations, setAllReservations] = useState<Reservation[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [internalReservationId, setInternalReservationId] = useState<number>(reservationId);

    useEffect(() => {
        if (internalReservationId) {
            fetchReservation(internalReservationId);
            fetchDrivers();
        } else {
            fetchAllReservations();
        }
    }, [internalReservationId]);

    const fetchAllReservations = async () => {
        try {
            setLoading(true);
            const response = await reservationService.getReservations({ 
                status: 'pending',
                limit: 100 
            });
            setAllReservations(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load reservations');
            setLoading(false);
        }
    };

    const fetchReservation = async (id: number) => {
        try {
            const data = await reservationService.getReservationById(id);
            if (data.reservation_status !== 'pending' && data.reservation_status !== 'pending_driver_approval' && data.reservation_status !== 'assigned') {
                // Allow re-assigning if assigned but not started maybe? 
                // But request says "rest stuff" which implies the existing logic.
                // Let's stick to 'pending' as currently done.
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
            await reservationService.assignDriver(internalReservationId, selectedDriverId);
            setSuccess(true);
            setTimeout(() => {
                router.push(`/reservations/${internalReservationId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign driver');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectReservation = (id: number) => {
        setInternalReservationId(id);
        setError(null);
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
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Select Trip to Assign</h2>
                                <Link
                                    href="/dispatch"
                                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back to Board
                                </Link>
                            </div>

                            {allReservations.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                                    <Car className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900">No pending trips</h3>
                                    <p className="text-slate-500 mt-1">There are no unassigned reservations at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {allReservations.map((res) => (
                                        <div 
                                            key={res.id}
                                            onClick={() => handleSelectReservation(res.id)}
                                            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono text-slate-400">{res.reservation_number}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                                                        {res.reservation_status}
                                                    </span>
                                                </div>
                                                <div className="font-semibold text-slate-900">{res.passenger_name}</div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {res.pickup_location.split(',')[0]} → {res.dropoff_location.split(',')[0]}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(res.pickup_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {res.pickup_time}
                                                </div>
                                            </div>
                                            <div className="md:border-l pl-4 flex items-center">
                                                <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg uppercase tracking-wide">
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
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
                        <div className="mb-6 flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setReservation(null);
                                    setInternalReservationId(0);
                                    fetchAllReservations();
                                }}
                                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Change Reservation
                            </button>
                            <Link
                                href={`/reservations/${internalReservationId}`}
                                className="text-xs font-medium text-emerald-600 hover:underline"
                            >
                                View Details
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
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReservation(null);
                                        setInternalReservationId(0);
                                        fetchAllReservations();
                                    }}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
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