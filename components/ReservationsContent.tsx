'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Car,
    User,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import reservationService from '@/app/services/reservationService';
import { Reservation } from '@/types/reservation.types';

export default function ReservationsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });
    
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        booking_type: searchParams.get('booking_type') || '',
        start_date: '',
        end_date: '',
        search: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchReservations();
    }, [pagination.page, filters.status, filters.booking_type, filters.search]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await reservationService.getReservations({
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status || undefined,
                booking_type: filters.booking_type || undefined,
                start_date: filters.start_date || undefined,
                end_date: filters.end_date || undefined,
                search: filters.search || undefined
            });
            setReservations(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchReservations();
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            booking_type: '',
            start_date: '',
            end_date: '',
            search: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearSearch = () => {
        setFilters(prev => ({ ...prev, search: '' }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
            'assigned': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Car },
            'in_progress': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Car },
            'completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3 mr-1" />
                {status.replace('_', ' ')}
            </span>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const config = {
            'pending': 'bg-amber-100 text-amber-700',
            'paid': 'bg-green-100 text-green-700',
            'failed': 'bg-red-100 text-red-700',
            'refunded': 'bg-slate-100 text-slate-700'
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config[status as keyof typeof config]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Reservations" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header Actions */}
                        <div className="flex justify-end mb-6">
                            <Link
                                href="/reservations/create"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Reservation
                            </Link>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {(filters.status || filters.booking_type || filters.start_date || filters.end_date) && (
                                        <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                                            Active
                                        </span>
                                    )}
                                </button>
                                {(filters.status || filters.booking_type || filters.start_date || filters.end_date || filters.search) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-slate-500 hover:text-slate-700"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Booking Type
                                        </label>
                                        <select
                                            value={filters.booking_type}
                                            onChange={(e) => handleFilterChange('booking_type', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        >
                                            <option value="">All Types</option>
                                            <option value="form">Form Booking</option>
                                            <option value="contract">Contract</option>
                                            <option value="manual">Manual</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.start_date}
                                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.end_date}
                                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <form onSubmit={handleSearch} className="mt-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by passenger name, email, phone, or reservation number..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-24 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {filters.search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Reservations Table */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                                </div>
                            ) : reservations.length === 0 ? (
                                <div className="text-center py-12">
                                    {filters.search ? (
                                        <>
                                            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900 mb-2">No matching reservations found</h3>
                                            <p className="text-sm text-slate-500 mb-6">
                                                No reservations match "{filters.search}"
                                            </p>
                                            <button
                                                onClick={clearSearch}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                            >
                                                Clear search
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Car className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900 mb-2">No reservations found</h3>
                                            <p className="text-sm text-slate-500 mb-6">Get started by creating your first reservation</p>
                                            <Link
                                                href="/reservations/create"
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Reservation
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Reservation #
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Passenger
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Trip Details
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Payment
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-3">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {reservations.map((res) => (
                                                    <tr 
                                                        key={res.id} 
                                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                                        onClick={() => router.push(`/reservations/${res.id}`)}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-slate-900">
                                                                {res.reservation_number}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {new Date(res.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                                    <User className="h-4 w-4 text-slate-500" />
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-slate-900">
                                                                        {res.passenger_name}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {res.passenger_phone}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-slate-900">
                                                                {res.pickup_location}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {new Date(res.pickup_date).toLocaleDateString()} at {res.pickup_time}
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-1">
                                                                {res.vehicle_type || `Vehicle #${res.vehicle_type_id}`}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(res.reservation_status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getPaymentStatusBadge(res.payment_status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-slate-900">
                                                                ${res.price}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                                className="text-slate-400 hover:text-slate-600"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
                                            <div className="text-sm text-slate-500">
                                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                                {pagination.total} results
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                    disabled={pagination.page === 1}
                                                    className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <span className="text-sm text-slate-600">
                                                    Page {pagination.page} of {pagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                    disabled={pagination.page === pagination.totalPages}
                                                    className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}