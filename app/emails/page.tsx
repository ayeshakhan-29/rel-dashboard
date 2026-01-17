'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Search, RefreshCw, Loader2, ExternalLink, Calendar, User, FileText } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '../components/auth/PrivateRoute';
import { listEmails, getEmailById, Email, EmailListResponse } from '../services/gmailService';
import GoogleConnectionStatus from '@/components/GoogleConnectionStatus';

export default function EmailsPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterQuery, setFilterQuery] = useState('');
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);

    useEffect(() => {
        checkGoogleConnection();
    }, []);

    useEffect(() => {
        if (isGoogleConnected) {
            fetchEmails();
        }
    }, [isGoogleConnected, filterQuery]);

    const checkGoogleConnection = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const accessToken = sessionStorage.getItem('accessToken') || '';
            const response = await fetch(`${apiUrl}/auth/google/status`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
            });
            const data = await response.json();
            setIsGoogleConnected(data.data?.connected || false);
        } catch (err) {
            console.error('Error checking Google connection:', err);
            setIsGoogleConnected(false);
        }
    };

    const fetchEmails = async (pageToken?: string) => {
        try {
            if (pageToken) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await listEmails(50, filterQuery, pageToken || undefined);
            if (response.success && response.data) {
                if (pageToken) {
                    setEmails(prev => [...prev, ...(response.data.emails || [])]);
                } else {
                    setEmails(response.data.emails || []);
                }
                setNextPageToken(response.data.nextPageToken || null);
            }
        } catch (err: any) {
            console.error('Error fetching emails:', err);
            setError(err.response?.data?.message || 'Failed to load emails');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleEmailClick = async (emailId: string) => {
        try {
            const response = await getEmailById(emailId);
            if (response.success && response.data) {
                setSelectedEmail(response.data);
            }
        } catch (err: any) {
            console.error('Error fetching email details:', err);
            setError(err.response?.data?.message || 'Failed to load email');
        }
    };

    const handleSearch = () => {
        setFilterQuery(searchQuery);
    };

    const handleRefresh = () => {
        fetchEmails();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(parseInt(dateString));
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days === 0) {
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } else if (days === 1) {
                return 'Yesterday';
            } else if (days < 7) {
                return `${days} days ago`;
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
            }
        } catch {
            return dateString;
        }
    };

    const parseEmailAddress = (address: string) => {
        const match = address.match(/^(.+?)\s*<(.+?)>$/);
        if (match) {
            return { name: match[1].trim(), email: match[2].trim() };
        }
        return { name: address, email: address };
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Gmail" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-hidden bg-slate-50">
                        <GoogleConnectionStatus onConnectionChange={setIsGoogleConnected} />

                        {!isGoogleConnected ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center p-8">
                                    <Mail className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-slate-700 mb-2">
                                        Connect Your Google Account
                                    </h2>
                                    <p className="text-slate-500 mb-4">
                                        Please connect your Google account to view your emails.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full">
                                {/* Email List */}
                                <div className="w-1/3 border-r border-slate-200 flex flex-col">
                                    {/* Search Bar */}
                                    <div className="p-4 border-b border-slate-200 bg-white">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search emails..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                    className="pl-9 pr-4 py-2 text-black text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white w-full"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSearch}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                                            >
                                                Search
                                            </button>
                                            <button
                                                onClick={handleRefresh}
                                                disabled={refreshing}
                                                className="px-3 text-black py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email List */}
                                    <div className="flex-1 overflow-y-auto">
                                        {loading ? (
                                            <div className="flex items-center justify-center h-64">
                                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                            </div>
                                        ) : error ? (
                                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded m-4">
                                                {error}
                                            </div>
                                        ) : emails.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                                <Mail className="h-12 w-12 mb-4 text-slate-300" />
                                                <p>No emails found</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {emails.map((email) => {
                                                    const from = parseEmailAddress(email.from);
                                                    const isUnread = (email.labels || []).includes('UNREAD');
                                                    return (
                                                        <div
                                                            key={email.id}
                                                            onClick={() => handleEmailClick(email.id)}
                                                            className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 ${selectedEmail?.id === email.id ? 'bg-emerald-50 border-l-4 border-emerald-500' :
                                                                isUnread ? 'bg-white border-l-4 border-slate-900 shadow-sm' : 'bg-slate-50/50 border-l-4 border-transparent'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-1">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${isUnread ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                                                                        {from.name || from.email}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                                                    {formatDate(email.internalDate)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm truncate mb-1 ${isUnread ? 'font-semibold' : 'text-slate-600'}`}>
                                                                {email.subject || '(No Subject)'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                                {email.snippet}
                                                            </p>
                                                            {(email.labels || []).filter(l => l !== 'READ' && l !== 'UNREAD').length > 0 && (
                                                                <div className="flex gap-1 mt-2">
                                                                    {(email.labels || [])
                                                                        .filter(l => l !== 'READ' && l !== 'UNREAD')
                                                                        .slice(0, 2)
                                                                        .map((label) => (
                                                                            <span
                                                                                key={label}
                                                                                className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded"
                                                                            >
                                                                                {label}
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Load More */}
                                    {nextPageToken && !loading && (
                                        <div className="p-4 border-t border-slate-200 bg-white">
                                            <button
                                                onClick={() => fetchEmails(nextPageToken)}
                                                disabled={refreshing}
                                                className="w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Load More
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Email Detail */}
                                <div className="flex-1 overflow-y-auto bg-white">
                                    {selectedEmail ? (
                                        <div className="p-6">
                                            <div className="mb-6">
                                                <h1 className="text-2xl font-semibold text-slate-900 mb-4">
                                                    {selectedEmail.subject || '(No Subject)'}
                                                </h1>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-400" />
                                                        <span className="text-slate-600">From:</span>
                                                        <span className="font-medium text-slate-900">
                                                            {parseEmailAddress(selectedEmail.from).name || parseEmailAddress(selectedEmail.from).email}
                                                        </span>
                                                        <span className="text-slate-400">
                                                            &lt;{parseEmailAddress(selectedEmail.from).email}&gt;
                                                        </span>
                                                    </div>
                                                    {selectedEmail.to && (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-600">To:</span>
                                                            <span className="text-slate-900">{selectedEmail.to}</span>
                                                        </div>
                                                    )}
                                                    {selectedEmail.cc && (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-600">CC:</span>
                                                            <span className="text-slate-900">{selectedEmail.cc}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        <span className="text-slate-600">Date:</span>
                                                        <span className="text-slate-900">
                                                            {new Date(parseInt(selectedEmail.internalDate)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-200 pt-6">
                                                {selectedEmail.bodyHtml ? (
                                                    <div
                                                        className="prose prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                                                    />
                                                ) : (
                                                    <div className="whitespace-pre-wrap text-slate-700">
                                                        {selectedEmail.bodyText || selectedEmail.snippet}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                                <div className="mt-6 pt-6 border-t border-slate-200">
                                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Attachments ({selectedEmail.attachments.length})
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {selectedEmail.attachments.map((attachment, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                                                            >
                                                                <FileText className="h-4 w-4 text-slate-400" />
                                                                <span className="text-sm text-slate-700">{attachment.filename}</span>
                                                                {attachment.size && (
                                                                    <span className="text-xs text-slate-500 ml-auto">
                                                                        {(attachment.size / 1024).toFixed(1)} KB
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            <div className="text-center">
                                                <Mail className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                                <p>Select an email to view</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}

