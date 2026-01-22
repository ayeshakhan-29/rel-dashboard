'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '@/app/components/auth/PrivateRoute';
import { ringcentralAuth } from '@/app/services/ringcentralService';
import RingCentralConnect from '@/app/components/ringcentral/RingCentralConnect';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, MessageSquare, Users, Video, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

function RingCentralDashboardContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        checkStatus();
        
        // Check for OAuth callback result
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        if (success) {
            // Refresh status after successful connection
            setTimeout(() => {
                checkStatus();
            }, 1000);
        }
    }, [searchParams]);

    const checkStatus = async () => {
        try {
            setLoading(true);
            const response = await ringcentralAuth.getStatus();
            setStatus(response);
        } catch (error: any) {
            console.error('Error checking status:', error);
            setStatus({ connected: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        {
            title: 'Calls',
            description: 'Make calls and view call history',
            icon: Phone,
            href: '/calls',
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700'
        },
        {
            title: 'Messages',
            description: 'Send SMS/MMS and view messages',
            icon: MessageSquare,
            href: '/messages',
            color: 'from-green-500 to-green-600',
            hoverColor: 'hover:from-green-600 hover:to-green-700'
        },
        {
            title: 'Team Messaging',
            description: 'Chat with your team',
            icon: Users,
            href: '/teams',
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:from-purple-600 hover:to-purple-700'
        },
        {
            title: 'Video Meetings',
            description: 'Schedule and join video meetings',
            icon: Video,
            href: '/meetings',
            color: 'from-orange-500 to-orange-600',
            hoverColor: 'hover:from-orange-600 hover:to-orange-700'
        }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="RingCentral" onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">RingCentral Integration</h1>
                            <p className="text-slate-600">Connect and manage your RingCentral communications</p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mb-4"></div>
                                <p className="text-sm font-medium text-slate-600">Loading connection status...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Connection Status Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-slate-900">Connection Status</h2>
                                        {status?.connected && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm font-medium">Connected</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <RingCentralConnect onStatusChange={checkStatus} />
                                    
                                    {status?.connected && (
                                        <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-green-900 mb-2">Successfully Connected</p>
                                                    {status.account && (
                                                        <div className="space-y-1.5">
                                                            <p className="text-sm text-green-800">
                                                                <span className="font-medium">Account:</span> {status.account.name}
                                                            </p>
                                                            {status.extension && (
                                                                <p className="text-sm text-green-800">
                                                                    <span className="font-medium">Extension:</span> {status.extension.name} ({status.extension.extensionNumber})
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {status?.error && !status?.connected && (
                                        <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800 mb-1">Connection Error</p>
                                                <p className="text-sm text-red-700">{status.error}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Links */}
                                {status?.connected && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                        <h2 className="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {quickLinks.map((link) => {
                                                const Icon = link.icon;
                                                return (
                                                    <button
                                                        key={link.href}
                                                        onClick={() => router.push(link.href)}
                                                        className={`group relative p-6 bg-gradient-to-br ${link.color} ${link.hoverColor} rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                                                                <Icon className="h-6 w-6" />
                                                            </div>
                                                            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold mb-1">{link.title}</h3>
                                                        <p className="text-sm text-white/90">{link.description}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function RingCentralDashboard() {
    return (
        <PrivateRoute>
            <Suspense fallback={
                <div className="flex h-screen bg-slate-50">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                            <div className="max-w-6xl mx-auto">
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mb-4"></div>
                                    <p className="text-sm font-medium text-slate-600">Loading...</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            }>
                <RingCentralDashboardContent />
            </Suspense>
        </PrivateRoute>
    );
}
