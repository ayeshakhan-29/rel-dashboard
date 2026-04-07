'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface DriverRouteProps {
    children: React.ReactNode;
}

/**
 * DriverRoute component - Protects routes that require driver role
 */
const DriverRoute: React.FC<DriverRouteProps> = ({ children }) => {
    const { isAuthenticated, isDriver, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isDriver && !isAdmin) {
                // Admins can also view driver routes for support/debugging
                router.push('/');
            }
        }
    }, [isAuthenticated, isDriver, isAdmin, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
                    <p className="mt-4 text-slate-600 font-medium tracking-tight">Securing your session...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated or not driver (or admin)
    if (!isAuthenticated || (!isDriver && !isAdmin)) {
        return null;
    }

    return <>{children}</>;
};

export default DriverRoute;
