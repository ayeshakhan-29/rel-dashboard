'use client';

import { useState } from 'react';
import { Video, Calendar, Clock, Users, RefreshCw, Trash2, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { Meeting } from '@/app/services/ringcentralService';
import { ringcentralMeetings } from '@/app/services/ringcentralService';

interface MeetingListProps {
    meetings: Meeting[];
    loading: boolean;
    onRefresh?: () => void;
    onMeetingDeleted?: () => void;
}

export default function MeetingList({ meetings, loading, onRefresh, onMeetingDeleted }: MeetingListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not scheduled';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 0) return 'Past meeting';
        if (diffMins < 60) return `In ${diffMins} minutes`;
        if (diffHours < 24) return `In ${diffHours} hours`;
        if (diffDays < 7) return `In ${diffDays} days`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (meetingId: string) => {
        if (!confirm('Are you sure you want to delete this meeting?')) {
            return;
        }

        try {
            setDeletingId(meetingId);
            await ringcentralMeetings.deleteMeeting(meetingId);
            if (onMeetingDeleted) {
                onMeetingDeleted();
            }
        } catch (error: any) {
            console.error('Error deleting meeting:', error);
            alert('Failed to delete meeting: ' + error.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mb-3"></div>
                <p className="text-sm font-medium text-slate-600">Loading meetings...</p>
            </div>
        );
    }

    if (meetings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Video className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">No meetings scheduled</p>
                <p className="text-xs text-slate-500 mb-4">Create your first meeting to see it here</p>
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
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {meetings.map((meeting) => (
                    <div
                        key={meeting.id}
                        className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <Video className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-slate-900 mb-1 truncate">{meeting.topic}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(meeting.start_time)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {meeting.duration} min
                                            </span>
                                            {meeting.participant_count > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {meeting.participant_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <a
                                        href={meeting.join_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Join Meeting
                                    </a>
                                    <a
                                        href={meeting.host_join_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Host Join
                                    </a>
                                    <button
                                        onClick={() => handleCopyUrl(meeting.join_url)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                        title="Copy join URL"
                                    >
                                        {copiedUrl === meeting.join_url ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                <span>Copy URL</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {meeting.password && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                                        <span className="text-xs font-medium text-amber-800">Password:</span>
                                        <span className="text-xs font-mono text-amber-900">{meeting.password}</span>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={() => handleDelete(meeting.meeting_id)}
                                disabled={deletingId === meeting.meeting_id}
                                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete meeting"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
