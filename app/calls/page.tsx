'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '@/app/components/auth/PrivateRoute';
import { ringcentralCalls, Call } from '@/app/services/ringcentralService';
import Dialer from '@/app/components/ringcentral/Dialer';
import CallHistory from '@/app/components/ringcentral/CallHistory';

export default function CallsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [calls, setCalls] = useState<Call[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCallHistory();
    }, []);

    const loadCallHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ringcentralCalls.getCallHistory();
            setCalls(response.calls);
        } catch (err: any) {
            console.error('Error loading call history:', err);
            setError(err.message || 'Failed to load call history');
        } finally {
            setLoading(false);
        }
    };

    const handleCallMade = () => {
        // Refresh call history after making a call
        loadCallHistory();
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Calls" onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Cloud Phone</h1>
                                <p className="text-slate-600">Make calls and manage your call history</p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Dialer */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Make a Call</h2>
                                    <Dialer onCallMade={handleCallMade} />
                                </div>

                                {/* Call History */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Call History</h2>
                                    <CallHistory calls={calls} loading={loading} onRefresh={loadCallHistory} />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}
