'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '@/app/components/auth/PrivateRoute';
import { ringcentralMeetings, Meeting } from '@/app/services/ringcentralService';
import MeetingScheduler from '@/app/components/ringcentral/MeetingScheduler';
import MeetingList from '@/app/components/ringcentral/MeetingList';

export default function MeetingsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ringcentralMeetings.getMeetings();
            setMeetings(response.meetings);
        } catch (err: any) {
            console.error('Error loading meetings:', err);
            setError(err.message || 'Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleMeetingCreated = () => {
        loadMeetings();
    };

    const handleMeetingDeleted = () => {
        loadMeetings();
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Video Meetings" onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Video Meetings</h1>
                                <p className="text-slate-600">Schedule and manage your video conferences</p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Meeting Scheduler */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Schedule Meeting</h2>
                                    <MeetingScheduler onMeetingCreated={handleMeetingCreated} />
                                </div>

                                {/* Meeting List */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">My Meetings</h2>
                                    <MeetingList 
                                        meetings={meetings} 
                                        loading={loading} 
                                        onRefresh={loadMeetings}
                                        onMeetingDeleted={handleMeetingDeleted}
                                    />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}
