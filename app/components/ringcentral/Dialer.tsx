'use client';

import { useState } from 'react';
import { Phone, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';
import { ringcentralCalls } from '@/app/services/ringcentralService';

interface DialerProps {
    onCallMade?: () => void;
}

export default function Dialer({ onCallMade }: DialerProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleCall = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!phoneNumber.trim()) {
            setError('Please enter a phone number');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await ringcentralCalls.makeCall({ to: phoneNumber });
            
            setSuccess(`Call initiated to ${phoneNumber}`);
            setPhoneNumber('');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
            if (onCallMade) {
                onCallMade();
            }
        } catch (err: any) {
            console.error('Error making call:', err);
            setError(err.response?.data?.message || err.message || 'Failed to make call');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCall} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Phone className="h-4 w-4 text-slate-500" />
                    Phone Number
                </label>
                <div className="relative">
                    <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 pl-11 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                        disabled={loading}
                    />
                    <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !phoneNumber.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Calling...</span>
                    </>
                ) : (
                    <>
                        <PhoneCall className="h-5 w-5" />
                        <span>Make Call</span>
                    </>
                )}
            </button>
        </form>
    );
}
