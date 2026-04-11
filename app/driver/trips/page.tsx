'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DriverRoute from '@/app/components/auth/DriverRoute';
import NotificationBell from '@/components/NotificationBell';
import Sidebar from '@/components/Sidebar';
import reservationService from '@/app/services/reservationService';
import api from '@/app/services/api';
import { Reservation } from '@/types/reservation.types';
import {
    Car, Calendar, Clock, ArrowRight, Loader2, AlertCircle, RefreshCw, Circle,
} from 'lucide-react';
import Pagination from '@/components/Pagination';

// ── Trip status config ────────────────────────────────────────────────────────
const TRIP_STATUS_STYLES: Record<string, string> = {
    pending:                 'bg-amber-100 text-amber-700 border-amber-200',
    pending_driver_approval: 'bg-violet-100 text-violet-700 border-violet-200',
    assigned:                'bg-blue-100 text-blue-700 border-blue-200',
    confirmed:               'bg-emerald-100 text-emerald-700 border-emerald-200',
    in_progress:             'bg-orange-100 text-orange-700 border-orange-200',
    completed:               'bg-slate-100 text-slate-600 border-slate-200',
    cancelled:               'bg-rose-100 text-rose-700 border-rose-200',
    rejected:                'bg-rose-100 text-rose-700 border-rose-200',
    driver_denied:           'bg-rose-100 text-rose-700 border-rose-200',
};

const TRIP_STATUS_LABELS: Record<string, string> = {
    pending: 'Pending', pending_driver_approval: 'Awaiting Approval',
    assigned: 'Assigned', confirmed: 'Accepted', in_progress: 'On Trip',
    completed: 'Completed', cancelled: 'Cancelled', rejected: 'Rejected', driver_denied: 'Denied',
};

// What trip statuses a driver can move to from the current one
const NEXT_TRIP_STATUSES: Record<string, { value: string; label: string; color: string }[]> = {
    pending_driver_approval: [
        { value: 'confirmed',     label: '✓ Accept',      color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
        { value: 'driver_denied', label: '✕ Deny',        color: 'bg-rose-600 hover:bg-rose-700 text-white' },
    ],
    assigned: [
        { value: 'confirmed',     label: '✓ Accept',      color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
        { value: 'driver_denied', label: '✕ Deny',        color: 'bg-rose-600 hover:bg-rose-700 text-white' },
    ],
    confirmed: [
        { value: 'in_progress',   label: '🚗 Start Trip', color: 'bg-sky-600 hover:bg-sky-700 text-white' },
        { value: 'completed',     label: '✓ Complete',    color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    ],
    in_progress: [
        { value: 'completed',     label: '✓ Complete',    color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    ],
};

// ── Driver availability status config ─────────────────────────────────────────
const DRIVER_STATUS_STYLES: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700',
    on_trip:   'bg-orange-100 text-orange-700',
    off_duty:  'bg-slate-100 text-slate-500',
    inactive:  'bg-red-100 text-red-600',
};

function TripStatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${TRIP_STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {TRIP_STATUS_LABELS[status] ?? status}
        </span>
    );
}

function TripsContent() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Trips state
    const [trips, setTrips] = useState<Reservation[]>([]);
    const [tripsLoading, setTripsLoading] = useState(true);
    const [tripsError, setTripsError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<number | null>(null);
    const [selected, setSelected] = useState<Record<number, string>>({});
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Driver profile state
    const [driverStatus, setDriverStatus] = useState<string>('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // ── Load driver profile ──────────────────────────────────────────────────
    const loadProfile = async () => {
        try {
            setProfileLoading(true);
            const res = await api.get('/drivers/me');
            setDriverStatus(res.data.data.status);
        } catch {
            // non-fatal
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Load trips ───────────────────────────────────────────────────────────
    const loadTrips = async () => {
        try {
            setTripsLoading(true);
            const res = await reservationService.getDriverTrips({ limit: 50 });
            setTrips(res.data || []);
            setTripsError(null);
        } catch {
            setTripsError('Failed to load trips.');
        } finally {
            setTripsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        loadTrips();
    }, []);

    // ── Update driver availability ───────────────────────────────────────────
    const handleDriverStatus = async (newStatus: string) => {
        if (!newStatus || statusUpdating) return;
        setStatusUpdating(true);
        try {
            await api.patch('/drivers/me/status', { status: newStatus });
            setDriverStatus(newStatus);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    // ── Update trip status ───────────────────────────────────────────────────
    const handleTripStatus = async (tripId: number, newStatus: string) => {
        if (!newStatus) return;
        setUpdating(tripId);
        setSelected(prev => ({ ...prev, [tripId]: newStatus }));
        try {
            await reservationService.updateStatus(tripId, newStatus);
            await loadTrips();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update trip status.');
        } finally {
            setUpdating(null);
            setSelected(prev => { const s = { ...prev }; delete s[tripId]; return s; });
        }
    };

    const totalPages = Math.ceil(trips.length / itemsPerPage);
    const currentTrips = trips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <DriverRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* ── Header ── */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">My Trips</h1>
                                <p className="text-sm text-slate-500 mt-0.5">Your assigned reservations</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Driver availability status */}
                                {!profileLoading && (
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${DRIVER_STATUS_STYLES[driverStatus] ?? 'bg-slate-100 text-slate-500'}`}>
                                            <Circle className="h-2 w-2 fill-current" />
                                            {driverStatus.replace('_', ' ')}
                                        </span>
                                        {/* Only allow toggling between available / off_duty */}
                                        {(driverStatus === 'available' || driverStatus === 'off_duty') && (
                                            <select
                                                value={driverStatus}
                                                onChange={e => handleDriverStatus(e.target.value)}
                                                disabled={statusUpdating}
                                                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                            >
                                                <option value="available">Available</option>
                                                <option value="off_duty">Off Duty</option>
                                            </select>
                                        )}
                                        {statusUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                                    </div>
                                )}
                                <button
                                    onClick={loadTrips}
                                    disabled={tripsLoading}
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition disabled:opacity-40"
                                >
                                    <RefreshCw className={`h-4 w-4 ${tripsLoading ? 'animate-spin' : ''}`} />
                                </button>
                                <NotificationBell />
                            </div>
                        </div>
                    </div>

                    {/* ── Trips list ── */}
                    <main className="flex-1 overflow-y-auto px-6 py-6">
                        {tripsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                            </div>
                        ) : tripsError ? (
                            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {tripsError}
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Car className="h-10 w-10 text-slate-300 mb-3" />
                                <p className="text-slate-600 font-medium">No trips assigned</p>
                                <p className="text-slate-400 text-sm mt-1">Check back later for new assignments.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-w-3xl mx-auto pb-8">
                                {currentTrips.map((trip) => {
                                    const isUpdating = updating === trip.id;
                                    const nextOpts = NEXT_TRIP_STATUSES[trip.reservation_status];
                                    return (
                                        <div key={trip.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            {/* Top row */}
                                            <div className="px-5 py-4 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-400">#{trip.reservation_number}</p>
                                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                                            {new Date(trip.pickup_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        {trip.pickup_time?.substring(0, 5)}
                                                    </span>
                                                    <TripStatusBadge status={trip.reservation_status} />
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div className="px-5 pb-4 space-y-2">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                    <span className="text-slate-700 leading-snug">{trip.pickup_location}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                                    <span className="text-slate-500 leading-snug">{trip.dropoff_location}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="px-5 pb-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                                                {nextOpts && (
                                                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                                                        {nextOpts.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => handleTripStatus(trip.id, opt.value)}
                                                                disabled={isUpdating}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${opt.color}`}
                                                            >
                                                                {isUpdating && selected[trip.id] === opt.value
                                                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                    : null
                                                                }
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => router.push(`/driver/trips/${trip.id}`)}
                                                    className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition shrink-0"
                                                >
                                                    Details <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {trips.length > 0 && (
                                    <div className="pt-4">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            itemsPerPage={itemsPerPage}
                                            totalItems={trips.length}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </DriverRoute>
    );
}

export default function DriverTripsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        }>
            <TripsContent />
        </Suspense>
    );
}
