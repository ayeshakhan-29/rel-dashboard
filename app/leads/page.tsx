'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Phone, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Lead } from '../services/leadsService';
import { getBookings, Booking } from '../services/formsService';

export default function LeadsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch form submissions (bookings) from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const bookingsData = await getBookings();

                // Map bookings to Lead format
                const normalizeDate = (value: any): string => {
                    if (!value) return '';
                    if (typeof value === 'string') return value;
                    if (typeof value === 'number') return new Date(value).toISOString();
                    if (value && typeof value === 'object') {
                        if (typeof (value as any).toDate === 'function') return (value as any).toDate().toISOString();
                        if (typeof (value as any).seconds === 'number') return new Date((value as any).seconds * 1000).toISOString();
                        if (typeof (value as any)._seconds === 'number') return new Date((value as any)._seconds * 1000).toISOString();
                    }
                    return '';
                };

                const mappedBookings: Lead[] = bookingsData.map((booking: Booking) => ({
                    id: booking.id,
                    name: booking.fullName || 'Unknown Name',
                    phone: booking.phone || '',
                    email: booking.email || '',
                    stage: 'Incoming',
                    source: 'Website',
                    last_message: booking.pickupLocation ? `Trip: ${booking.pickupLocation} to ${booking.dropoffLocation}` : undefined,
                    created_at: normalizeDate(booking.created_at ?? (booking as any).createdAt) || new Date().toISOString(),
                    updated_at: normalizeDate(booking.updated_at ?? (booking as any).updatedAt ?? (booking as any).createdAt) || new Date().toISOString(),
                }));

                setLeads(mappedBookings);
            } catch (err: any) {
                console.error('Failed to fetch form data:', err);
                setError(err.response?.data?.message || 'Failed to load form data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter leads by search query
    const filteredLeads = leads.filter((lead) => {
        if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !lead.phone.includes(searchQuery) && 
            !lead.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="All Leads" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    {/* Filters and Actions */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="relative text-black">
                                <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search leads by name, phone, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white w-80 shadow-sm transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            <span className="ml-3 text-slate-600">Loading leads...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Error loading leads</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Leads Grid */}
                    {!loading && !error && (
                        <>
                            {filteredLeads.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-600">No form submissions found</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {searchQuery
                                            ? 'Try adjusting your search'
                                            : 'Waiting for new form submissions'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredLeads.map((lead) => (
                                        <Link key={lead.id} href={`/leads/${lead.id}`}>
                                            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 cursor-pointer group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white font-semibold text-lg">
                                                                {lead.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                                                                {lead.name}
                                                            </h3>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 mt-1">
                                                                {lead.stage}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3 mb-4">
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Phone className="h-4 w-4 mr-3 text-slate-400" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center text-sm text-slate-600">
                                                            <Mail className="h-4 w-4 mr-3 text-slate-400" />
                                                            <span className="truncate">{lead.email}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                                                        <span>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'No date'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                                        {lead.source}
                                                    </span>
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                                
                                                {lead.last_message && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                            {lead.last_message}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
