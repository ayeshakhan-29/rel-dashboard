'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { getLeads, Lead } from '../services/leadsService';

export default function LeadsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch leads from API
    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getLeads();
                setLeads(response.data.leads);
            } catch (err: any) {
                console.error('Failed to fetch leads:', err);
                setError(err.response?.data?.message || 'Failed to load leads');
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    // Filter leads
    const filteredLeads = leads.filter((lead) => {
        if (filterStatus !== 'all' && lead.stage !== filterStatus) return false;
        if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !lead.phone.includes(searchQuery)) return false;
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
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white w-64"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 text-black py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                            >
                                <option value="all">All Stages</option>
                                <option value="New">New</option>
                                <option value="Incoming">Incoming</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal">Second Wing</option>
                                <option value="Second Wing">Second Wing</option>
                                <option value="Won">Won</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>
                        <Link
                            href="/add-lead"
                            className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lead
                        </Link>
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
                                    <p className="text-slate-600">No leads found</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {searchQuery || filterStatus !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Start by adding your first lead'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredLeads.map((lead) => (
                                        <Link key={lead.id} href={`/leads/${lead.id}`}>
                                            <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                                                        <p className="text-sm text-slate-600">{lead.phone}</p>
                                                        {lead.email && (
                                                            <p className="text-xs text-slate-500 mt-1">{lead.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${lead.stage === 'Won' ? 'bg-green-100 text-green-700' :
                                                            lead.stage === 'Lost' ? 'bg-red-100 text-red-700' :
                                                                lead.stage === 'Incoming' ? 'bg-blue-100 text-blue-700' :
                                                                    lead.stage === 'Contacted' ? 'bg-indigo-100 text-indigo-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {lead.stage}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{lead.source}</span>
                                                </div>
                                                {lead.last_message && (
                                                    <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                                                        {lead.last_message}
                                                    </p>
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
