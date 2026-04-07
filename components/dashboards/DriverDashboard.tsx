'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    Car,
    Clock,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    RefreshCw,
    Circle,
    MapPin,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import reservationService from '@/app/services/reservationService';
import api from '@/app/services/api';
import { Reservation } from '@/types/reservation.types';

// Driver availability status config
const DRIVER_STATUS_STYLES: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    on_trip:   'bg-orange-100 text-orange-700 border-orange-200',
    off_duty:  'bg-slate-100 text-slate-500 border-slate-200',
    inactive:  'bg-red-100 text-red-600 border-red-200',
};

function DashboardContent() {
    const router = useRouter();
    const { user } = useAuth();
    
    const [trips, setTrips] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [driverStatus, setDriverStatus] = useState<string>('');
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        upcoming: 0,
        active: 0
    });

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load driver profile for status
            const profileRes = await api.get('/drivers/me');
            let currentStatus = profileRes.data.data.status;

            // Load trips
            const tripsRes = await reservationService.getDriverTrips({ limit: 50 });
            const allTrips = tripsRes.data || [];
            setTrips(allTrips);

            // Auto-correct status: if on_trip but no active reservation (e.g. deleted by admin)
            const activeTripExists = allTrips.some(t => t.reservation_status === 'in_progress');
            if (currentStatus === 'on_trip' && !activeTripExists) {
                try {
                    await api.patch('/drivers/me/status', { status: 'available' });
                    currentStatus = 'available';
                } catch (err) {
                    console.error('Auto-correction of driver status failed:', err);
                }
            }
            
            setDriverStatus(currentStatus);

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const completed = allTrips.filter(t => t.reservation_status === 'completed').length;
            const active = allTrips.filter(t => t.reservation_status === 'in_progress').length;
            const upcoming = allTrips.filter(t => 
                ['assigned', 'confirmed', 'pending_driver_approval'].includes(t.reservation_status)
            ).length;
            const todayCount = allTrips.filter(t => 
                t.pickup_date && t.pickup_date.startsWith(today)
            ).length;

            setStats({
                total: todayCount,
                completed,
                upcoming,
                active
            });

        } catch (err) {
            console.error('Failed to load driver dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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

    const handleTripStatus = async (tripId: number, newStatus: string) => {
        if (!tripId || statusUpdating) return;
        setStatusUpdating(true);
        try {
            await reservationService.updateStatus(tripId, newStatus);
            await loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update trip status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
                <p className="text-slate-500 animate-pulse font-medium">Preparing your dashboard...</p>
            </div>
        );
    }

    const activeTrip = trips.find(t => t.reservation_status === 'in_progress');
    const nextTrip = trips.find(t => ['assigned', 'confirmed', 'pending_driver_approval'].includes(t.reservation_status));

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
                    <p className="text-slate-500 mt-1">Here's your overview for today</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${DRIVER_STATUS_STYLES[driverStatus] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        <Circle className={`h-2.5 w-2.5 ${driverStatus === 'available' ? 'fill-emerald-500' : driverStatus === 'on_trip' ? 'fill-orange-500' : 'fill-slate-400'}`} />
                        {driverStatus.replace('_', ' ').toUpperCase()}
                    </span>
                    {(driverStatus === 'available' || driverStatus === 'off_duty') && (
                        <select
                            value={driverStatus}
                            onChange={e => handleDriverStatus(e.target.value)}
                            disabled={statusUpdating}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all font-medium"
                        >
                            <option value="available">Set Available</option>
                            <option value="off_duty">Set Off Duty</option>
                        </select>
                    )}
                    <button 
                        onClick={loadData}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${statusUpdating ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Completed Trips</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Upcoming Trips</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.upcoming}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Active Trips</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.active}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Car className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Today's Trips</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Trip Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-emerald-600 px-6 py-3 flex items-center justify-between">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                {activeTrip ? 'Current Active Trip' : 'Status: Ready for work'}
                            </h3>
                            {activeTrip && (
                                <span className="text-emerald-100 text-xs font-medium bg-emerald-700/50 px-2.5 py-1 rounded-full border border-emerald-500/30">
                                    ON TRIP
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            {activeTrip ? (
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pickup</p>
                                                    <p className="text-sm text-slate-700 font-medium leading-snug">{activeTrip.pickup_location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Dropoff</p>
                                                    <p className="text-sm text-slate-700 font-medium leading-snug">{activeTrip.dropoff_location}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900">{activeTrip.pickup_time?.substring(0, 5)}</p>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Pickup Time</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                {activeTrip.passenger_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger</p>
                                                <p className="text-sm font-semibold text-slate-800">{activeTrip.passenger_name}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => router.push(`/driver/trips/${activeTrip.id}`)}
                                            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                                        >
                                            View Trip Details <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Car className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-600 font-semibold">No active trip currently</p>
                                    <p className="text-slate-400 text-sm mt-1">Assignments will appear here when you start them.</p>
                                    {driverStatus === 'off_duty' && (
                                        <button 
                                            onClick={() => handleDriverStatus('available')}
                                            className="mt-4 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition"
                                        >
                                            GO ONLINE
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Upcoming List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Upcoming Assignments</h3>
                            <button 
                                onClick={() => router.push('/driver/trips')}
                                className="text-sm text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                            >
                                View All
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {trips.filter(t => ['assigned', 'confirmed', 'pending_driver_approval'].includes(t.reservation_status)).slice(0, 3).map(trip => (
                                <div key={trip.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => router.push(`/driver/trips/${trip.id}`)}>
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                                                {new Date(trip.pickup_date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-sm font-bold text-slate-700 leading-tight">
                                                {new Date(trip.pickup_date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 pr-4">
                                            <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{trip.pickup_location}</p>
                                            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Pickup at {trip.pickup_time?.substring(0, 5)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        {(trip.reservation_status === 'pending_driver_approval' || trip.reservation_status === 'assigned') ? (
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => handleTripStatus(trip.id, 'confirmed')}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition shadow-sm"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleTripStatus(trip.id, 'driver_denied')}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-50 transition"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    trip.reservation_status === 'confirmed' 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {trip.reservation_status === 'confirmed' ? 'Accepted' : trip.reservation_status}
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {stats.upcoming === 0 && (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-slate-500 text-sm italic font-medium">No upcoming trips scheduled.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar area of dashboard */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Support & Tools</h3>
                        <div className="space-y-2">
                             <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Service Coverage</span>
                             </button>
                             <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Emergency Help</span>
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DriverDashboard() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
