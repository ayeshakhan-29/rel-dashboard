'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TaskStatusBadge from '@/components/TaskStatusBadge';
import MeetingScheduler from '@/components/MeetingScheduler';
import { getLeadDetails, sendWhatsAppMessage, LeadDetails } from '../../services/leadsService';
import { getTasks, Task } from '../../services/tasksService';
import { createCalendarMeeting } from '../../services/calendarService';

export default function LeadDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = parseInt(params.id as string);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lead, setLead] = useState<LeadDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Message form state
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [sendSuccess, setSendSuccess] = useState(false);

    // Tasks state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);

    // Meeting scheduling state
    const [isScheduling, setIsScheduling] = useState(false);
    const [meetingError, setMeetingError] = useState<string | null>(null);
    const [meetingLink, setMeetingLink] = useState<string | null>(null);

    // Fetch lead details and tasks
    useEffect(() => {
        const fetchLead = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getLeadDetails(leadId);
                setLead(response.lead);
            } catch (err: any) {
                console.error('Failed to fetch lead:', err);
                setError(err.response?.data?.error || 'Failed to load lead details');
            } finally {
                setLoading(false);
            }
        };

        const fetchTasks = async () => {
            try {
                setTasksLoading(true);
                const response = await getTasks({ lead_id: leadId });
                setTasks(response.data);
            } catch (err: any) {
                console.error('Failed to fetch tasks:', err);
            } finally {
                setTasksLoading(false);
            }
        };

        if (leadId) {
            fetchLead();
            fetchTasks();
        }
    }, [leadId]);

    // Send WhatsApp message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || !lead) return;

        try {
            setSending(true);
            setSendError(null);
            setSendSuccess(false);

            await sendWhatsAppMessage({
                leadId: lead.id,
                phone: lead.phone,
                message: message.trim()
            });

            setSendSuccess(true);
            setMessage('');

            // Refresh lead details to show new message
            const response = await getLeadDetails(leadId);
            setLead(response.lead);

            // Clear success message after 3 seconds
            setTimeout(() => setSendSuccess(false), 3000);
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setSendError(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="h-3 w-3 text-slate-400" />;
            case 'delivered':
                return <CheckCircle className="h-3 w-3 text-blue-500" />;
            case 'read':
                return <CheckCircle className="h-3 w-3 text-green-500" />;
            case 'failed':
                return <AlertCircle className="h-3 w-3 text-red-500" />;
            default:
                return <Clock className="h-3 w-3 text-slate-400" />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Lead Details" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/leads')}
                        className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Leads
                    </button>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            <span className="ml-3 text-slate-600">Loading lead details...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Error loading lead</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Lead Details */}
                    {!loading && !error && lead && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Lead Info */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Lead Card */}
                                <div className="bg-white rounded-lg border border-slate-200 p-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">{lead.name}</h2>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <Phone className="h-4 w-4 text-slate-400 mr-3" />
                                            <span className="text-slate-700">{lead.phone}</span>
                                        </div>

                                        {lead.email && (
                                            <div className="flex items-center text-sm">
                                                <Mail className="h-4 w-4 text-slate-400 mr-3" />
                                                <span className="text-slate-700">{lead.email}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm">
                                            <Calendar className="h-4 w-4 text-slate-400 mr-3" />
                                            <span className="text-slate-700">
                                                Created {formatDate(lead.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-600">Stage</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${lead.stage === 'Won' ? 'bg-green-100 text-green-700' :
                                                    lead.stage === 'Lost' ? 'bg-red-100 text-red-700' :
                                                        lead.stage === 'Incoming' ? 'bg-blue-100 text-blue-700' :
                                                            lead.stage === 'Contacted' ? 'bg-slate-100 text-slate-700' :
                                                                'bg-slate-100 text-slate-700'
                                                }`}>
                                                {lead.stage}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Source</span>
                                            <span className="text-sm font-medium text-slate-900">{lead.source}</span>
                                        </div>
                                    </div>

                                    {/* Schedule Meeting */}
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Schedule Meeting
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setIsScheduling(prev => !prev)}
                                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                            >
                                                {isScheduling ? 'Close' : 'New Meeting'}
                                            </button>
                                        </div>

                                        {meetingLink && (
                                            <div className="mb-3 text-xs">
                                                <span className="font-medium text-slate-700">Last meeting link: </span>
                                                <a
                                                    href={meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:text-emerald-700 break-all"
                                                >
                                                    {meetingLink}
                                                </a>
                                            </div>
                                        )}

                                        {meetingError && (
                                            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2">
                                                <p className="text-xs text-red-600">{meetingError}</p>
                                            </div>
                                        )}

                                        {isScheduling && (
                                            <MeetingScheduler
                                                lead={lead}
                                                onMeetingCreated={(meetLink) => {
                                                    setMeetingLink(meetLink);
                                                    setIsScheduling(false);
                                                    // Refresh lead details to show timeline update
                                                    getLeadDetails(leadId).then(response => {
                                                        setLead(response.lead);
                                                    }).catch(console.error);
                                                }}
                                                onError={(error) => {
                                                    setMeetingError(error);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="bg-white rounded-lg border border-slate-200 p-6">
                                    <h3 className="text-base font-semibold text-slate-900 mb-4">Timeline</h3>
                                    <div className="space-y-4">
                                        {lead.timeline.length === 0 ? (
                                            <p className="text-sm text-slate-500">No timeline events yet</p>
                                        ) : (
                                            lead.timeline.map((event) => (
                                                <div key={event.id} className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-600"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-900">{event.description}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {formatDate(event.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Tasks */}
                                <div className="bg-white rounded-lg border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-slate-900">Related Tasks</h3>
                                        <button
                                            onClick={() => router.push(`/create-task?lead_id=${leadId}`)}
                                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            + Add Task
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {tasksLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 mr-2" />
                                                <span className="text-sm text-slate-600">Loading tasks...</span>
                                            </div>
                                        ) : tasks.length === 0 ? (
                                            <div className="text-center py-6">
                                                <p className="text-sm text-slate-500">No tasks for this lead yet</p>
                                                <button
                                                    onClick={() => router.push(`/create-task?lead_id=${leadId}`)}
                                                    className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                                                >
                                                    Create the first task
                                                </button>
                                            </div>
                                        ) : (
                                            tasks.map((task) => (
                                                <div key={task.id} className="border border-slate-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
                                                            {task.description && (
                                                                <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                                            )}
                                                            <div className="flex items-center space-x-4 mt-2">
                                                                {task.due_date && (
                                                                    <span className="text-xs text-slate-500">
                                                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {task.priority}
                                                                </span>
                                                                <TaskStatusBadge
                                                                    taskId={task.id}
                                                                    currentStatus={task.status}
                                                                    onStatusUpdate={(taskId, newStatus) => {
                                                                        // Update the task in local state
                                                                        setTasks(prevTasks =>
                                                                            prevTasks.map(t =>
                                                                                t.id === taskId
                                                                                    ? { ...t, status: newStatus }
                                                                                    : t
                                                                            )
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Messages */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg border border-slate-200 h-full flex flex-col">
                                    {/* Messages Header */}
                                    <div className="p-6 border-b border-slate-200">
                                        <h3 className="text-base font-semibold text-slate-900 flex items-center">
                                            <MessageSquare className="h-5 w-5 mr-2" />
                                            WhatsApp Messages
                                        </h3>
                                    </div>

                                    {/* Messages List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {lead.messages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-600">No messages yet</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Start a conversation by sending a message below
                                                </p>
                                            </div>
                                        ) : (
                                            lead.messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-lg p-4 ${msg.direction === 'outbound'
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-slate-100 text-slate-900'
                                                            }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                                                        <div className={`flex items-center justify-end space-x-2 mt-2 text-xs ${msg.direction === 'outbound' ? 'text-emerald-50' : 'text-slate-500'
                                                            }`}>
                                                            <span>{formatDate(msg.created_at)}</span>
                                                            {msg.direction === 'outbound' && getMessageStatusIcon(msg.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Send Message Form */}
                                    <div className="p-6 border-t border-slate-200">
                                        {sendSuccess && (
                                            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                                <span className="text-sm text-green-700">Message sent successfully!</span>
                                            </div>
                                        )}

                                        {sendError && (
                                            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                                                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                                <span className="text-sm text-red-700">{sendError}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSendMessage} className="flex text-black space-x-3">
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                disabled={sending}
                                                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !message.trim()}
                                                className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                                            >
                                                {sending ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
