'use client';

import React, { useState } from 'react';
import AdminRoute from '../components/auth/AdminRoute';
import { useAuth } from '../context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

function AdminContent() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Admin Dashboard" 
                    onMenuClick={() => setSidebarOpen(true)} 
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-foreground">Welcome Back, {user?.name}</h1>
                            <p className="text-slate-600 dark:text-slate-400">Here's what's happening today.</p>
                        </div>
                        
                        <AdminDashboard />
                    </div>
                </main>
            </div>
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
