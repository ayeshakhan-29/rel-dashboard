'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, Loader2, User as UserIcon, Filter } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { attendanceService, AttendanceRecord } from '@/app/services/attendanceService';
import AdminRoute from '@/app/components/auth/AdminRoute';

export default function AttendanceRecordPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date: '',
        employeeName: ''
    });

    useEffect(() => {
        fetchRecords();
    }, [filters]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await attendanceService.getRecords(filters);
            setRecords(response.data);
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: 'short'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString([], {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AdminRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Attendance Record" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Attendance Record</h2>
                                <p className="text-sm text-slate-600">Historical check-in and check-out data</p>
                            </div>

                            {/* Filters */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="employeeName"
                                        placeholder="Search employee name..."
                                        value={filters.employeeName}
                                        onChange={handleFilterChange}
                                        className="pl-10 pr-4 py-2 border text-black border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    />
                                </div>
                                <div className="relative">
                                    <CalendarIcon className="absolute text-black left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={filters.date}
                                        onChange={handleFilterChange}
                                        className="pl-10 pr-4 py-2 border text-black border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    />
                                </div>
                                <button
                                    onClick={() => setFilters({ date: '', employeeName: '' })}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {records.length > 0 ? (
                                                    records.map((record) => {
                                                        const checkIn = new Date(record.check_in);
                                                        const checkOut = record.check_out ? new Date(record.check_out) : null;
                                                        let duration = '--';
                                                        if (checkOut) {
                                                            const diff = checkOut.getTime() - checkIn.getTime();
                                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                            duration = `${hours}h ${minutes}m`;
                                                        }

                                                        return (
                                                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                                    {formatDate(record.date)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-2">
                                                                            <UserIcon className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-slate-900">{record.employee_name}</div>
                                                                            <div className="text-xs text-slate-500">{record.employee_email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                                    {formatDateTime(record.check_in)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                                    {formatDateTime(record.check_out)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${checkOut ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                                                        }`}>
                                                                        {duration}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                                            No records found for the selected filters
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}
