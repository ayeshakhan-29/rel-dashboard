'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DriverRoute from '@/app/components/auth/DriverRoute';
import NotificationBell from '@/components/NotificationBell';
import Sidebar from '@/components/Sidebar';
import reservationService from '@/app/services/reservationService';
import { Reservation } from '@/types/reservation.types';
import {
    ArrowLeft, Loader2, AlertCircle, Clock,
    User, Phone, Mail, Car, Users, Briefcase, ChevronDown,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
    pending:                 'bg-amber-100 text-amber-700 border-amber-200',
    pending_driver_approval: 'bg-violet-100 text-violet-700 border-violet-200',
    assigned:                'bg-blue-100 text-blue-700 border-blue-200',
    confirmed:               'bg-emerald-100 text-emerald-700 border-emerald-200',
    in_progress:             'bg-orange-100 text-orange-700 border-orange-200',
    completed:               'bg-slate-100 text-slate-600 border-slate-200',
    cancelled:               'bg-rose-100 text-rose-700 border-rose-200',
    driver_denied:           'bg-rose-100 text-rose-700 border-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending', pending_driver_approval: 'Awaiting Approval',
    assigned: 'Assigned', confirmed: 'Accepted', in_progress: 'On Trip',
    completed: 'Completed', cancelled: 'Cancelled', driver_denied: 'Denied',
};

// Statuses a driver can move to
const ROUTE_STATUS_OPTIONS = [
    { value: 'confirmed',   label: '✓ Accepted — Reservation approved' },
    { value: 'in_progress', label: '🚗 On Trip — Heading to destination' },
    { value: 'completed',   label: '🏁 Completed — Trip finished' },
];

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            {icon && <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>}
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm text-slate-700 mt-0.5 break-words">{value}</p>
            </div>
        </div>
    );
}

function TripDetailContent() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [trip, setTrip] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('');

    const loadTrip = async () => {
        try {
            setLoading(true);
            const data = await reservationService.getReservationById(parseInt(id));
            setTrip(data);
            setSelectedStatus('');
            setError(null);
        } catch {
            setError('Unable to load trip details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) loadTrip(); }, [id]);

    const handleQuickAction = async (newStatus: string) => {
        if (!trip || updating) return;
        setUpdating(true);
        try {
            await reservationService.updateStatus(trip.id, newStatus);
            await loadTrip();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
                <div className="bg-white border border-rose-200 rounded-xl p-6 text-center max-w-sm w-full shadow-sm">
                    <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
                    <p className="text-slate-700 text-sm mb-4">{error ?? 'Trip not found'}</p>
                    <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-800 transition">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    const isTerminal = ['completed', 'cancelled', 'driver_denied'].includes(trip.reservation_status);
    const isPendingApproval = trip.reservation_status === 'pending_driver_approval' || trip.reservation_status === 'assigned';
    
    // Status update dropdown visibility
    const showRouteDropdown = !isTerminal && trip.reservation_status !== 'pending' && trip.reservation_status !== 'pending_driver_approval';
    
    // Filter options to only show what makes sense from the current state
    const availableOptions = ROUTE_STATUS_OPTIONS.filter(opt => {
        // If assigned, they can accept, start, or complete
        if (trip.reservation_status === 'assigned') {
            return opt.value === 'confirmed' || opt.value === 'in_progress' || opt.value === 'completed';
        }
        // If confirmed (Accepted), they can start or complete
        if (trip.reservation_status === 'confirmed') {
            return opt.value === 'in_progress' || opt.value === 'completed';
        }
        // If in_progress (On Trip), they can only complete
        if (trip.reservation_status === 'in_progress') {
            return opt.value === 'completed';
        }
        return false;
    });

    return (
        <DriverRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => router.push('/driver/trips')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition"
                        >
                            <ArrowLeft className="h-4 w-4" /> My Trips
                        </button>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={trip.reservation_status} />
                            <NotificationBell />
                        </div>
                    </div>

                    <main className="flex-1 overflow-y-auto px-6 py-6">
                        <div className="max-w-2xl mx-auto space-y-4">

                            {/* Trip ID + date */}
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                                    Reservation #{trip.reservation_number}
                                </p>
                                <p className="text-base font-bold text-slate-900">
                                    {new Date(trip.pickup_date).toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                    Pickup at {trip.pickup_time?.substring(0, 5)}
                                </p>
                            </div>

                            {/* Route */}
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Route</p>
                                <div className="relative pl-5 space-y-5">
                                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500 to-slate-300" />
                                    <div className="relative">
                                        <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">Pickup</p>
                                        <p className="text-sm text-slate-800">{trip.pickup_location}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-slate-400 ring-2 ring-slate-100" />
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Drop-off</p>
                                        <p className="text-sm text-slate-800">{trip.dropoff_location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Passenger */}
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Passenger</p>
                                <InfoRow label="Name"  value={trip.passenger_name}  icon={<User className="h-4 w-4" />} />
                                <InfoRow label="Phone" value={trip.passenger_phone} icon={<Phone className="h-4 w-4" />} />
                                <InfoRow label="Email" value={trip.passenger_email} icon={<Mail className="h-4 w-4" />} />
                            </div>

                            {/* Trip info */}
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Trip Info</p>
                                <InfoRow label="Vehicle"    value={trip.vehicle_type ?? '—'}          icon={<Car className="h-4 w-4" />} />
                                <InfoRow label="Passengers" value={String(trip.passenger_count ?? 1)} icon={<Users className="h-4 w-4" />} />
                                <InfoRow label="Luggage"    value={`${trip.luggage_count ?? 0} bags`} icon={<Briefcase className="h-4 w-4" />} />
                            </div>

                            {/* Action Required — Accept/Decline */}
                            {isPendingApproval && (
                                <div className="bg-white border-2 border-emerald-500 rounded-xl px-5 py-5 shadow-lg space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                                            <AlertCircle className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">New Assignment</p>
                                            <p className="text-xs text-slate-500">Please accept or decline this trip.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleQuickAction('confirmed')}
                                            disabled={updating}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                        >
                                            Accept Trip
                                        </button>
                                        <button
                                            onClick={() => handleQuickAction('driver_denied')}
                                            disabled={updating}
                                            className="bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-lg transition disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Route status dropdown — only after trip is accepted */}
                            {showRouteDropdown && (
                                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm space-y-3">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                        Update Route Status
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {trip.reservation_status === 'in_progress'
                                            ? 'You are currently on the way. Mark as completed once the passenger is dropped off.'
                                            : 'Trip accepted. Update when you are on the way or have completed the trip.'}
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={selectedStatus}
                                            onChange={e => setSelectedStatus(e.target.value)}
                                            className="w-full appearance-none text-sm border border-slate-300 rounded-lg px-3 py-3 pr-10 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        >
                                            <option value="">— Select route status —</option>
                                            {availableOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => handleQuickAction(selectedStatus)}
                                        disabled={!selectedStatus || updating}
                                        className={`w-full py-3 rounded-lg text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                            selectedStatus === 'completed'
                                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                                : 'bg-sky-600 hover:bg-sky-700'
                                        }`}
                                    >
                                        {updating
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
                                            : 'Confirm Status'
                                        }
                                    </button>
                                </div>
                            )}

                            {/* Terminal state */}
                            {isTerminal && (
                                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm text-center">
                                    <StatusBadge status={trip.reservation_status} />
                                    <p className="text-xs text-slate-400 mt-2">No further actions available</p>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>
        </DriverRoute>
    );
}

export default function TripDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        }>
            <TripDetailContent />
        </Suspense>
    );
}
