'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // This page handles the OAuth callback
        // The actual callback is handled by the backend route
        // This is just a loading page while redirect happens
        
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        if (error) {
            router.push(`/dashboard/ringcentral?error=${encodeURIComponent(error)}`);
        } else if (success) {
            router.push('/dashboard/ringcentral?success=true');
        } else {
            // Wait a moment for backend to process, then redirect
            setTimeout(() => {
                router.push('/dashboard/ringcentral');
            }, 2000);
        }
    }, [router, searchParams]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing RingCentral connection...</p>
            </div>
        </div>
    );
}

export default function RingCentralCallback() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
