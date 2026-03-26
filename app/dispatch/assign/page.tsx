import AssignDriverContent from '@/components/dispatch/AssignDriverContent';
import { Suspense } from 'react';

export default function AssignDriverPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen bg-slate-50 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        }>
            <AssignDriverContent/>
        </Suspense>
    );
}