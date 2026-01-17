'use client';

import { useState } from 'react';
import { Users, UserPlus, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SecurityCard from '@/components/SecurityCard';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Settings" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Security Card */}
                        <div className="mb-6">
                            <SecurityCard />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* All Users */}
                            <Link href="/all-users">
                                <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Users className="h-5 w-5 text-slate-700" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900">All Users</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        View and manage all users in the system
                                    </p>
                                </div>
                            </Link>

                            {/* Create User */}
                            <Link href="/create-user">
                                <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <UserPlus className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900">Create User</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Add a new user to the system
                                    </p>
                                </div>
                            </Link>

                            {/* Logout Section */}
                            <div className="bg-white rounded-lg border border-red-200 p-6 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="p-2 bg-red-50 rounded-lg">
                                                <LogOut className="h-5 w-5 text-red-600" />
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-900">Logout</h3>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Sign out of your account
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Logging out...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
