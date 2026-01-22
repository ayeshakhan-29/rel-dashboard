'use client';

import { useState } from 'react';
import { Link2, Unlink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ringcentralAuth } from '@/app/services/ringcentralService';

interface RingCentralConnectProps {
    onStatusChange?: () => void;
}

export default function RingCentralConnect({ onStatusChange }: RingCentralConnectProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await ringcentralAuth.getAuthUrl();
            
            // Redirect to RingCentral authorization
            if (response.authUrl) {
                window.location.href = response.authUrl;
            } else {
                throw new Error('No authorization URL received');
            }
        } catch (err: any) {
            console.error('Error initiating connection:', err);
            setError(err.message || 'Failed to connect RingCentral');
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your RingCentral account?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            await ringcentralAuth.disconnect();
            
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (err: any) {
            console.error('Error disconnecting:', err);
            setError(err.message || 'Failed to disconnect RingCentral');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <Link2 className="h-5 w-5" />
                    {loading ? 'Connecting...' : 'Connect RingCentral'}
                </button>
                
                <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    <Unlink className="h-5 w-5" />
                    Disconnect
                </button>
            </div>
        </div>
    );
}
