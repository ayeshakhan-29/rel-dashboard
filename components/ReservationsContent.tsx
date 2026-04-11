'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
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
    AlertCircle,
    Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
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
        payment_status: searchParams.get('payment_status') || '',
        start_date: '',
        end_date: '',
        search: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    useEffect(() => {
        fetchReservations();
    }, [pagination.page, filters.status, filters.booking_type, filters.payment_status, filters.search]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await reservationService.getReservations({
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status || undefined,
                booking_type: filters.booking_type || undefined,
                payment_status: filters.payment_status || undefined,
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

    const { isAdmin } = useAuth();

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
            payment_status: '',
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

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await reservationService.deleteReservation(id);
            setReservations(prev => prev.filter(r => r.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            console.error('Failed to delete reservation:', error);
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
            'assigned': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Car },
            'in_progress': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: Car },
            'completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
            'cancelled': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3 mr-1" />
                {status === 'in_progress' ? 'On Trip' : status.replace('_', ' ')}
            </span>
        );
    };

    const getPaymentStatusBadge = (status: string | undefined) => {
        const key = (status || 'pending').toLowerCase();
        const config: Record<string, string> = {
            pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            refunded: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
        };
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config[key] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {label}
            </span>
        );
    };

    return (
        <>
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Reservations" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
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
                        <div className="bg-card rounded-xl border border-border p-4 mb-6 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {(filters.status || filters.booking_type || filters.payment_status || filters.start_date || filters.end_date) && (
                                        <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs">
                                            Active
                                        </span>
                                    )}
                                </button>
                                {(filters.status || filters.booking_type || filters.start_date || filters.end_date || filters.search) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-card text-foreground transition-colors"
                                        >
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="in_progress">On Trip</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Booking Type
                                        </label>
                                        <select
                                            value={filters.booking_type}
                                            onChange={(e) => handleFilterChange('booking_type', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-card text-foreground transition-colors"
                                        >
                                            <option value="">All Types</option>
                                            <option value="form">Form Booking</option>
                                            <option value="contract">Contract</option>
                                            <option value="manual">Manual</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Payment
                                        </label>
                                        <select
                                            value={filters.payment_status}
                                            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-card text-foreground transition-colors"
                                        >
                                            <option value="">All</option>
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="failed">Failed</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.start_date}
                                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-card text-foreground transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.end_date}
                                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-card text-foreground transition-colors"
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
                                        className="w-full pl-10 pr-24 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-card text-foreground transition-colors placeholder:text-slate-400"
                                    />
                                    {filters.search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Reservations Table */}
                        <div className="bg-card rounded-xl border border-border overflow-hidden transition-colors duration-300 shadow-sm">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                                </div>
                            ) : reservations.length === 0 ? (
                                <div className="text-center py-12">
                                    {filters.search ? (
                                        <>
                                            <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-foreground mb-2">No matching reservations found</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                                No reservations match "{filters.search}"
                                            </p>
                                            <button
                                                onClick={clearSearch}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                            >
                                                Clear search
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Car className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-foreground mb-2">No reservations found</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Get started by creating your first reservation</p>
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
                                        <table className="min-w-full divide-y divide-border">
                                            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Reservation #
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Passenger
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Trip Details
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Payment
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-3">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-border">
                                                {reservations.map((res) => (
                                                    <tr 
                                                        key={res.id} 
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                        onClick={() => router.push(`/reservations/${res.id}`)}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-foreground">
                                                                {res.reservation_number}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {new Date(res.created_at).toLocaleDateString()}
                                                            </div>
                                                            {res.booking_type === 'form' && res.form_booking_ref && (
                                                                <div className="text-[10px] font-mono text-slate-400 mt-0.5 max-w-[140px] truncate" title={res.form_booking_ref}>
                                                                    {res.form_booking_ref}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                                    <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-foreground">
                                                                        {res.passenger_name}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                        {res.passenger_phone}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-foreground">
                                                                {res.pickup_location}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
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
                                                            <div className="text-sm font-medium text-foreground">
                                                                ${res.price}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setConfirmDeleteId(res.id);
                                                                    }}
                                                                    className="text-slate-400 hover:text-rose-600 transition-colors"
                                                                    title="Delete reservation"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                        itemsPerPage={pagination.limit}
                                        totalItems={pagination.total}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>

        {/* Delete confirmation modal */}
        {confirmDeleteId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                            <Trash2 className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">Delete reservation?</p>
                            <p className="text-sm text-slate-500">This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(confirmDeleteId)}
                            disabled={deletingId === confirmDeleteId}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {deletingId === confirmDeleteId && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}