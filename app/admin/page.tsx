'use client';

import React from 'react';
import AdminRoute from '../components/auth/AdminRoute';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

function AdminContent() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-sm text-gray-600">Restricted Access Area</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Admin Welcome */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-center mb-4">
                        <span className="text-5xl mr-4">👑</span>
                        <div>
                            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                            <p className="text-purple-100 mt-1">Welcome, {user?.name}</p>
                        </div>
                    </div>
                    <p className="text-purple-100">
                        You have full administrative access to the system. Manage users, settings, and monitor activity.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                            <span className="text-2xl">👥</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">1,234</p>
                        <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
                            <span className="text-2xl">🔐</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">856</p>
                        <p className="text-sm text-blue-600 mt-2">Currently online</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">API Requests</h3>
                            <span className="text-2xl">📊</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">45.2K</p>
                        <p className="text-sm text-purple-600 mt-2">Last 24 hours</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">System Health</h3>
                            <span className="text-2xl">💚</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">99.9%</p>
                        <p className="text-sm text-green-600 mt-2">All systems operational</p>
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Administrative Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group text-left">
                            <div className="text-3xl mb-3">👤</div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600">Manage Users</h4>
                            <p className="text-sm text-gray-600">View, edit, and manage user accounts</p>
                        </button>

                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group text-left">
                            <div className="text-3xl mb-3">⚙️</div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">System Settings</h4>
                            <p className="text-sm text-gray-600">Configure application settings</p>
                        </button>

                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group text-left">
                            <div className="text-3xl mb-3">📈</div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600">Analytics</h4>
                            <p className="text-sm text-gray-600">View detailed analytics and reports</p>
                        </button>

                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:shadow-md transition-all group text-left">
                            <div className="text-3xl mb-3">🔒</div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-yellow-600">Security</h4>
                            <p className="text-sm text-gray-600">Manage security and permissions</p>
                        </button>

                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:shadow-md transition-all group text-left">
                            <div className="text-3xl mb-3">📝</div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-red-600">Audit Logs</h4>
                            <p className="text-sm text-gray-600">Review system activity logs</p>
                        </button>

                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left">
                            <div className="text-3xl mb-3">💾</div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600">Backups</h4>
                            <p className="text-sm text-gray-600">Manage database backups</p>
                        </button>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">ℹ️</span>
                        <div>
                            <h3 className="text-lg font-semibold text-purple-900 mb-2">Admin Access Notice</h3>
                            <p className="text-purple-800">
                                This page is only accessible to users with admin role. Regular users will be redirected to the dashboard.
                            </p>
                            <p className="text-purple-700 mt-2 text-sm">
                                Current user: <strong>{user?.email}</strong> | Role: <strong className="uppercase">{user?.role}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AdminPage() {
    return (
        <AdminRoute>
            <AdminContent />
        </AdminRoute>
    );
}
