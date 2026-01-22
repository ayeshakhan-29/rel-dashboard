'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '@/app/components/auth/PrivateRoute';
import { ringcentralMessages, Message } from '@/app/services/ringcentralService';
import MessageList from '@/app/components/ringcentral/MessageList';
import MessageComposer from '@/app/components/ringcentral/MessageComposer';

export default function MessagesPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'Inbound' | 'Outbound'>('all');

    useEffect(() => {
        loadMessages();
    }, [filter]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ringcentralMessages.getMessages(
                50,
                0,
                filter === 'all' ? undefined : filter
            );
            setMessages(response.messages);
        } catch (err: any) {
            console.error('Error loading messages:', err);
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleMessageSent = () => {
        loadMessages();
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Messages" onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">SMS & MMS Messages</h1>
                                <p className="text-slate-600">Send and manage your text messages</p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Message Composer */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Send Message</h2>
                                    <MessageComposer onMessageSent={handleMessageSent} />
                                </div>

                                {/* Message List */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-slate-900">Messages</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setFilter('all')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                    filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => setFilter('Inbound')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                    filter === 'Inbound' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                Inbound
                                            </button>
                                            <button
                                                onClick={() => setFilter('Outbound')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                    filter === 'Outbound' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                Outbound
                                            </button>
                                        </div>
                                    </div>
                                    <MessageList messages={messages} loading={loading} onRefresh={loadMessages} />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}
