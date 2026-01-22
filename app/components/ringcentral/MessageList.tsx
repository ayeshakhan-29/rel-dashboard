'use client';

import { MessageSquare, Phone, RefreshCw, ArrowDown, ArrowUp, Paperclip } from 'lucide-react';
import { Message } from '@/app/services/ringcentralService';

interface MessageListProps {
    messages: Message[];
    loading: boolean;
    onRefresh?: () => void;
}

export default function MessageList({ messages, loading, onRefresh }: MessageListProps) {
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mb-3"></div>
                <p className="text-sm font-medium text-slate-600">Loading messages...</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">No messages yet</p>
                <p className="text-xs text-slate-500 mb-4">Send your first message to see it here</p>
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
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`group p-4 rounded-xl border transition-all duration-200 ${
                            message.direction === 'Inbound' 
                                ? 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-md' 
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                message.direction === 'Inbound' 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                                {message.direction === 'Inbound' ? (
                                    <ArrowDown className="h-5 w-5" />
                                ) : (
                                    <ArrowUp className="h-5 w-5" />
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        message.direction === 'Inbound' 
                                            ? 'bg-blue-100 text-blue-700' 
                                            : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {message.direction === 'Inbound' ? 'Incoming' : 'Outgoing'}
                                    </span>
                                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full">
                                        {message.message_type}
                                    </span>
                                    {message.attachment_count > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                                            <Paperclip className="h-3 w-3" />
                                            {message.attachment_count}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1">
                                            {message.direction === 'Inbound' ? 'From' : 'To'}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {message.direction === 'Inbound' ? message.from_number : message.to_number}
                                        </p>
                                    </div>
                                    
                                    {message.message_text && (
                                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                                                {message.message_text}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <span>{formatDate(message.created_at)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
