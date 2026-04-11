'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from './components/auth/PrivateRoute';
import { useAuth } from './context/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import TeamDashboard from '@/components/dashboards/TeamDashboard';

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, isTeam, isDriver, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');

  useEffect(() => {
    if (loading) return;
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, loading, router]);

  // Don't render anything while auth is resolving or a redirect is in flight
  if (loading || isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const getTitle = () => {
    if (isAdmin) return "Admin Dashboard";
    if (isDriver) return "Driver Dashboard";
    if (isTeam && (!tab || tab === 'home')) return "Team Dashboard";

    switch (tab) {
      case 'profile': return 'My Profile';
      case 'attendance': return 'Attendance';
      case 'tasks': return 'My Tasks';
      case 'notifications': return 'Notifications';
      default: return 'Overview';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
          {isAdmin ? (
            <AdminDashboard />
          ) : isDriver ? (
            <DriverDashboard />
          ) : isTeam && (!tab || tab === 'home') ? (
            <TeamDashboard />
          ) : (
            <EmployeeDashboard />
          )}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PrivateRoute>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </PrivateRoute>
  );
}
