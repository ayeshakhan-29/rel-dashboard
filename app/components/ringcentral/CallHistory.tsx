'use client';

import { PhoneIncoming, PhoneOutgoing, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Call } from '@/app/services/ringcentralService';

interface CallHistoryProps {
    calls: Call[];
    loading: boolean;
    onRefresh?: () => void;
}

export default function CallHistory({ calls, loading, onRefresh }: CallHistoryProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusIcon = (status: string) => {
        if (status?.toLowerCase().includes('completed') || status?.toLowerCase().includes('answered')) {
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        }
        if (status?.toLowerCase().includes('failed') || status?.toLowerCase().includes('busy')) {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <Clock className="h-4 w-4 text-yellow-600" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mb-3"></div>
                <p className="text-sm font-medium text-slate-600">Loading call history...</p>
            </div>
        );
    }

    if (calls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <PhoneIncoming className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">No call history yet</p>
                <p className="text-xs text-slate-500 mb-4">Make your first call to see it here</p>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {onRefresh && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </button>
                </div>
            )}
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {calls.map((call) => (
                    <div
                        key={call.id}
                        className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    call.direction === 'Inbound' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {call.direction === 'Inbound' ? (
                                        <PhoneIncoming className="h-5 w-5" />
                                    ) : (
                                        <PhoneOutgoing className="h-5 w-5" />
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            call.direction === 'Inbound' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {call.direction === 'Inbound' ? 'Incoming' : 'Outgoing'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(call.status)}
                                            <span className="text-xs text-slate-500 capitalize">{call.status}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {call.direction === 'Inbound' ? call.from_number : call.to_number}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {call.direction === 'Inbound' ? 'From' : 'To'}: {call.direction === 'Inbound' ? call.from_number : call.to_number}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(call.start_time)}
                                        </span>
                                        {call.duration > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                {formatDuration(call.duration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
