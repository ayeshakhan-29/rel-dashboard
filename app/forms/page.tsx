'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, RefreshCw, Loader2, Calendar, User, MapPin, Phone, Mail, Clock, CheckCircle, Package } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '../components/auth/PrivateRoute';
import { getBookings, getBookingById, Booking } from '../services/formsService';

export default function FormsPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setRefreshing(true);
            setError(null);
            const data = await getBookings();
            setBookings(data);
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleBookingClick = async (booking: Booking) => {
        setSelectedBooking(booking);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            // Check if it's a firebase timestamp or string
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch {
            return dateString;
        }
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Forms" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-hidden bg-slate-50 flex h-full">
                        {/* Bookings List */}
                        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                                <h2 className="font-semibold text-slate-700">Bookings ({bookings.length})</h2>
                                <button
                                    onClick={fetchBookings}
                                    disabled={refreshing}
                                    className="px-2 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                    </div>
                                ) : error ? (
                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded m-4">
                                        {error}
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                        <FileText className="h-12 w-12 mb-4 text-slate-300" />
                                        <p>No new submissions</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                onClick={() => handleBookingClick(booking)}
                                                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${selectedBooking?.id === booking.id
                                                        ? 'bg-emerald-50 border-emerald-500'
                                                        : 'border-transparent'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                        {booking.fullName || 'Unknown Name'}
                                                    </h3>
                                                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                                        {formatDate(booking.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 truncate mb-1">
                                                    {booking.email}
                                                </p>
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    <span className="truncate">{booking.pickupLocation || 'No location'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Detail */}
                        <div className="flex-1 overflow-y-auto bg-white">
                            {selectedBooking ? (
                                <div className="p-8 max-w-4xl mx-auto">
                                    <div className="mb-8 pb-6 border-b border-slate-200">
                                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Details</h1>
                                        <p className="text-slate-500 text-sm">ID: {selectedBooking.id}</p>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                                <User className="h-5 w-5 mr-2 text-emerald-600" />
                                                Customer Information
                                            </h3>
                                            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full Name</span>
                                                    <p className="text-slate-900 font-medium">{selectedBooking.fullName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email</span>
                                                    <div className="flex items-center text-slate-900">
                                                        <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                        {selectedBooking.email}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone</span>
                                                    <div className="flex items-center text-slate-900">
                                                        <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                        {selectedBooking.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                                <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                                                Trip Details
                                            </h3>
                                            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date & Time</span>
                                                    <div className="flex items-center text-slate-900">
                                                        <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                        {selectedBooking.pickupDate} at {selectedBooking.pickupTime}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Distance & Duration</span>
                                                    <div className="flex items-center text-slate-900">
                                                        <span>{selectedBooking.distance} miles</span>
                                                        <span className="mx-2 text-slate-300">|</span>
                                                        <span>{selectedBooking.numberOfHours} hours</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-4">
                                                    <div>
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Passengers</span>
                                                        <div className="flex items-center text-slate-900">
                                                            <User className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                            {selectedBooking.numberOfPassengers}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Luggage</span>
                                                        <div className="flex items-center text-slate-900">
                                                            <Package className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                            {selectedBooking.luggageCount}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Locations */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                                            Route Information
                                        </h3>
                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 flex items-start">
                                                <div className="mt-1 mr-3 flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                    <div className="w-0.5 h-10 bg-slate-200" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Pickup</span>
                                                    <p className="text-slate-900 font-medium">{selectedBooking.pickupLocation}</p>
                                                    {selectedBooking.pickupLocationCoords && (
                                                        <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 inline-block px-1 rounded">
                                                            {selectedBooking.pickupLocationCoords}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 flex items-start">
                                                <div className="mt-1 mr-3">
                                                    <div className="w-3 h-3 rounded-full bg-slate-900" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Dropoff</span>
                                                    <p className="text-slate-900 font-medium">{selectedBooking.dropoffLocation}</p>
                                                    {selectedBooking.dropoffLocationCoords && (
                                                        <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 inline-block px-1 rounded">
                                                            {selectedBooking.dropoffLocationCoords}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extras */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                                            Extras
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedBooking.refreshments ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                                Refreshments: {selectedBooking.refreshments ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Raw Data (for debugging/extra fields) */}
                                    <div className="mt-12 pt-8 border-t border-slate-200">
                                        <details className="cursor-pointer">
                                            <summary className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 hover:text-slate-600 transition-colors">
                                                View Raw Data
                                            </summary>
                                            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                                {JSON.stringify(selectedBooking, null, 2)}
                                            </pre>
                                        </details>
                                    </div>

                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <FileText className="h-16 w-16 mb-4 text-slate-200" />
                                    <h3 className="text-lg font-medium text-slate-900">Select a Booking</h3>
                                    <p>Click on any booking from the list to view details</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}
