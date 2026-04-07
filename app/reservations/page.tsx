import ReservationsContent from '@/components/ReservationsContent';
import { Suspense } from 'react';
import AdminRoute from '@/app/components/auth/AdminRoute';

export default function ReservationsPage() {
    return (
        <AdminRoute>
            <Suspense fallback={
                <div className="flex h-screen bg-slate-50 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            }>
                <ReservationsContent />
            </Suspense>
        </AdminRoute>
    );
}