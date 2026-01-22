'use client';

import { useState } from 'react';
import { Video, Calendar, Clock, Lock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { ringcentralMeetings } from '@/app/services/ringcentralService';

interface MeetingSchedulerProps {
    onMeetingCreated?: () => void;
}

export default function MeetingScheduler({ onMeetingCreated }: MeetingSchedulerProps) {
    const [topic, setTopic] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ joinUrl: string; hostJoinUrl: string } | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!topic.trim()) {
            setError('Please enter a meeting topic');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const meetingData: any = {
                topic,
                duration
            };

            if (startTime) {
                meetingData.startTime = new Date(startTime).toISOString();
            }

            if (password) {
                meetingData.password = password;
            }

            const response = await ringcentralMeetings.createMeeting(meetingData);
            
            setSuccess({
                joinUrl: response.meeting.join_url,
                hostJoinUrl: response.meeting.host_join_url
            });
            
            setTopic('');
            setStartTime('');
            setDuration(60);
            setPassword('');
            
            if (onMeetingCreated) {
                onMeetingCreated();
            }
        } catch (err: any) {
            console.error('Error creating meeting:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="topic" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Video className="h-4 w-4 text-slate-500" />
                    Meeting Topic *
                </label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Team Standup Meeting"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="startTime" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    Start Time (Optional)
                </label>
                <input
                    type="datetime-local"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900"
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Duration (minutes)
                </label>
                <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    min="15"
                    max="480"
                    step="15"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900"
                    disabled={loading}
                />
                <p className="text-xs text-slate-500">Minimum 15 minutes, maximum 8 hours</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Lock className="h-4 w-4 text-slate-500" />
                    Password (Optional)
                </label>
                <input
                    type="text"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                    disabled={loading}
                />
            </div>

            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-900 mb-1">Meeting created successfully!</p>
                            <p className="text-xs text-green-700">Share these links with participants</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1.5">Join URL (Participants)</p>
                            <div className="flex items-center gap-2">
                                <a
                                    href={success.joinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-xs text-blue-600 hover:text-blue-800 hover:underline break-all font-mono"
                                >
                                    {success.joinUrl}
                                </a>
                                <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1.5">Host Join URL</p>
                            <div className="flex items-center gap-2">
                                <a
                                    href={success.hostJoinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-xs text-blue-600 hover:text-blue-800 hover:underline break-all font-mono"
                                >
                                    {success.hostJoinUrl}
                                </a>
                                <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Creating Meeting...</span>
                    </>
                ) : (
                    <>
                        <Video className="h-5 w-5" />
                        <span>Create Meeting</span>
                    </>
                )}
            </button>
        </form>
    );
}
