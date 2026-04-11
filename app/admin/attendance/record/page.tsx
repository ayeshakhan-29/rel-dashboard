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
            <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Attendance Record" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 transition-colors duration-300">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Attendance Record</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Historical check-in and check-out data</p>
                            </div>

                            {/* Filters */}
                            <div className="bg-card p-4 rounded-2xl border border-border shadow-sm mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 transition-colors">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="employeeName"
                                        placeholder="Search employee name..."
                                        value={filters.employeeName}
                                        onChange={handleFilterChange}
                                        className="pl-10 pr-4 py-2 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={filters.date}
                                        onChange={handleFilterChange}
                                        className="pl-10 pr-4 py-2 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setFilters({ date: '', employeeName: '' })}
                                    className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                                >
                                    Reset
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : (
                                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-colors">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border">
                                            <thead className="bg-background transition-colors">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Employee</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Check In</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Check Out</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
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
                                                            <tr key={record.id} className="hover:bg-background transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                                                                    {formatDate(record.date)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                                                            <UserIcon className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-semibold text-foreground">{record.employee_name}</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{record.employee_email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                                    {formatDateTime(record.check_in)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                                    {formatDateTime(record.check_out)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                                        checkOut
                                                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                                    }`}>
                                                                        {duration}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
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
