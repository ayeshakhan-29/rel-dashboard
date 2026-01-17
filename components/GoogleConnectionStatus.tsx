'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface GoogleConnectionStatusProps {
    onConnectionChange?: (connected: boolean) => void;
}

export default function GoogleConnectionStatus({ onConnectionChange }: GoogleConnectionStatusProps) {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkConnectionStatus = useCallback(async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const accessToken = sessionStorage.getItem('accessToken') || '';
            const response = await fetch(`${apiUrl}/auth/google/status`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
            });

            if (response.ok) {
                const body = await response.json();
                const connected = (body && body.data && typeof body.data.connected === 'boolean')
                    ? body.data.connected
                    : (typeof body?.connected === 'boolean' ? body.connected : false);
                setIsConnected(connected);
                onConnectionChange?.(connected);
            } else {
                setIsConnected(false);
                onConnectionChange?.(false);
            }
        } catch (err) {
            console.error('Error checking Google connection:', err);
            setError('Failed to check Google connection status');
            setIsConnected(false);
            onConnectionChange?.(false);
        } finally {
            setLoading(false);
        }
    }, [onConnectionChange]);

    const handleConnect = () => {
        // Get the access token from sessionStorage
        const accessToken = sessionStorage.getItem('accessToken');

        if (!accessToken) {
            setError('Please log in first to connect your Google account');
            return;
        }

        // Redirect to Google OAuth using full API URL with token as query parameter
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const oauthUrl = `${apiUrl}/auth/google?token=${encodeURIComponent(accessToken)}`;

        console.log('Connecting to Google OAuth:', oauthUrl);

        // For OAuth flow, we need to redirect directly to maintain session
        window.location.href = oauthUrl;
    };

    const handleDisconnect = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const accessToken = sessionStorage.getItem('accessToken') || '';
            const response = await fetch(`${apiUrl}/auth/google/disconnect`, {
                method: 'POST',
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
            });

            if (response.ok) {
                setIsConnected(false);
                onConnectionChange?.(false);
            } else {
                setError('Failed to disconnect Google account');
            }
        } catch (err) {
            console.error('Error disconnecting Google account:', err);
            setError('Failed to disconnect Google account');
        }
    };

    useEffect(() => {
        checkConnectionStatus();
    }, [checkConnectionStatus]);

    if (loading) {
        return (
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-600">Checking Google connection...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                </div>
                <button
                    onClick={checkConnectionStatus}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Google Calendar connected</span>
                </div>
                <button
                    onClick={handleDisconnect}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <div>
                    <p className="text-sm text-yellow-700 font-medium">Google Calendar not connected</p>
                    <p className="text-xs text-yellow-600">Connect your Google account to view and manage calendar events</p>
                </div>
            </div>
            <button
                onClick={handleConnect}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
            >
                <ExternalLink className="h-3 w-3" />
                <span>Connect Google</span>
            </button>
        </div>
    );
}
