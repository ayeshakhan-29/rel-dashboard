'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Users, AlertCircle, MessageSquare } from 'lucide-react';
import { Team, TeamMessage } from '@/app/services/ringcentralService';
import { ringcentralTeams } from '@/app/services/ringcentralService';

interface TeamChatProps {
    team: Team;
    messages: TeamMessage[];
    onMessageSent?: () => void;
}

export default function TeamChat({ team, messages, onMessageSent }: TeamChatProps) {
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!messageText.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await ringcentralTeams.sendTeamMessage(team.id, { text: messageText });
            
            setMessageText('');
            
            if (onMessageSent) {
                onMessageSent();
            }
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.message || err.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

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
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900 truncate">{team.name}</h2>
                    {team.description && (
                        <p className="text-xs text-slate-500 truncate">{team.description}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600 mb-1">No messages yet</p>
                        <p className="text-xs text-slate-500">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className="flex items-start gap-3 group"
                        >
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {message.sender_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-semibold text-slate-900">{message.sender_name}</span>
                                    <span className="text-xs text-slate-500">{formatDate(message.created_at)}</span>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{message.message_text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="mx-6 mb-4 flex items-start gap-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSend} className="px-6 py-4 border-t border-slate-200 bg-white">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !messageText.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                <span className="hidden sm:inline">Send</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
