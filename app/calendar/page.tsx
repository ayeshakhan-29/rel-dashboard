'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import GoogleConnectionStatus from '@/components/GoogleConnectionStatus';
import {
    CalendarDays,
    Calendar as CalendarIcon,
    Clock,
    Video,
    Plus,
    ChevronLeft,
    ChevronRight,
    Users,
    MapPin,
    Edit,
    Trash2,
    ExternalLink,
    Filter,
    Search,
    Loader2,
    MoreVertical,
    Eye
} from 'lucide-react';
import PrivateRoute from '../components/auth/PrivateRoute';
import {
    createCalendarMeeting,
    getMeetingsForDate,
    getAllUpcomingMeetings,
    deleteCalendarMeeting,
    CalendarMeeting
} from '../services/calendarService';

type ViewMode = 'month' | 'week' | 'day' | 'list';

export default function CalendarPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default to list view
    const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
    const [allMeetings, setAllMeetings] = useState<CalendarMeeting[]>([]); // All meetings
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<CalendarMeeting | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);

    // Meeting creation state
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        participants: [] as string[],
        newParticipant: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    // Initialize dates on client side to avoid hydration mismatch
    useEffect(() => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
        setIsClient(true);
    }, []);

    const fetchMeetings = async (date: Date) => {
        // Don't fetch if Google is not connected
        if (googleConnected === false) {
            setMeetings([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const dateStr = date.toISOString().split('T')[0];
            const response = await getMeetingsForDate(dateStr);
            setMeetings(response.data.meetings);
        } catch (err: any) {
            console.error('Failed to fetch meetings:', err);
            setError(err.response?.data?.message || 'Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMeetings = async () => {
        // Don't fetch if Google is not connected
        if (googleConnected === false) {
            setAllMeetings([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // For now, we'll fetch meetings for the current month
            // In a real app, you might want to fetch a date range
            if (!currentDate) {
                return;
            }
            const cd = currentDate;
            const startOfMonth = new Date(cd.getFullYear(), cd.getMonth(), 1);
            const endOfMonth = new Date(cd.getFullYear(), cd.getMonth() + 1, 0);

            // Fetch meetings for each day of the month
            const allMeetingsPromises = [];
            for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                allMeetingsPromises.push(getMeetingsForDate(dateStr));
            }

            const responses = await Promise.all(allMeetingsPromises);
            const allMeetingsData = responses.flatMap(response => response.data.meetings);

            // Remove duplicates based on event ID
            const uniqueMeetings = allMeetingsData.filter((meeting, index, self) =>
                index === self.findIndex(m => m.id === meeting.id)
            );

            setAllMeetings(uniqueMeetings);
        } catch (err: any) {
            console.error('Failed to fetch all meetings:', err);
            setError(err.response?.data?.message || 'Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate && googleConnected === true) {
            fetchMeetings(selectedDate);
        }
    }, [selectedDate, googleConnected]);

    useEffect(() => {
        if (currentDate && googleConnected === true) {
            fetchAllMeetings();
        }
    }, [currentDate, googleConnected]);

    // Initial load - removed since we now initialize dates in the first useEffect

    const formatTimeRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        if (!currentDate) return;

        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
        if (viewMode !== 'month') {
            setSelectedDate(newDate);
        }
    };

    const generateCalendarDays = () => {
        if (!currentDate) return [];

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getLocalMeetingsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return allMeetings.filter(meeting =>
            meeting.start.startsWith(dateStr)
        );
    };

    const filteredMeetings = (viewMode === 'list' ? allMeetings : meetings).filter(meeting =>
        meeting.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort meetings by start time
    const sortedFilteredMeetings = filteredMeetings.sort((a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const addParticipant = () => {
        const email = newMeeting.newParticipant.trim();
        if (email && !newMeeting.participants.includes(email)) {
            setNewMeeting(prev => ({
                ...prev,
                participants: [...prev.participants, email],
                newParticipant: ''
            }));
        }
    };

    const removeParticipant = (email: string) => {
        setNewMeeting(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p !== email)
        }));
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) return;

        try {
            setCreateLoading(true);
            await createCalendarMeeting({
                title: newMeeting.title,
                description: newMeeting.description,
                startTime: new Date(newMeeting.startTime).toISOString(),
                endTime: new Date(newMeeting.endTime).toISOString(),
                participants: newMeeting.participants,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            // Reset form and close modal
            setNewMeeting({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                participants: [],
                newParticipant: ''
            });
            setShowCreateModal(false);

            // Refresh meetings
            if (selectedDate) {
                fetchMeetings(selectedDate);
            }
            fetchAllMeetings();
        } catch (err: any) {
            console.error('Failed to create meeting:', err);
            setError(err.response?.data?.message || 'Failed to create meeting');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteMeeting = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;

        try {
            await deleteCalendarMeeting(eventId);

            // Fetch meetings
            if (selectedDate) {
                fetchMeetings(selectedDate);
            }
            fetchAllMeetings();
            setSelectedMeeting(null);
        } catch (err: any) {
            console.error('Failed to delete meeting:', err);
            setError(err.response?.data?.message || 'Failed to delete meeting');
        }
    };

    const renderCalendarGrid = () => {
        const days = generateCalendarDays();
        const today = new Date();
        if (!currentDate || !selectedDate) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mr-2" />
                    <span className="text-slate-600">Loading calendar...</span>
                </div>
            );
        }
        const cd = currentDate;
        const sd = selectedDate;

        return (
            <div className="grid grid-cols-7 text-black gap-1">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-slate-500 bg-slate-50">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === cd.getMonth();
                    const isToday = day.toDateString() === today.toDateString();
                    const isSelected = day.toDateString() === sd.toDateString();
                    const dayMeetings = getLocalMeetingsForDate(day);

                    return (
                        <div
                            key={index}
                            onClick={() => setSelectedDate(day)}
                            className={`
                                min-h-[80px] p-1 border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors
                                ${!isCurrentMonth ? 'text-slate-300 bg-slate-25' : ''}
                                ${isToday ? 'bg-emerald-50 border-emerald-200' : ''}
                                ${isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''}
                            `}
                        >
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-emerald-600' : ''}`}>
                                {day.getDate()}
                            </div>
                            <div className="space-y-1">
                                {dayMeetings.slice(0, 2).map((meeting, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded truncate"
                                        title={meeting.summary}
                                    >
                                        {meeting.summary}
                                    </div>
                                ))}
                                {dayMeetings.length > 2 && (
                                    <div className="text-xs text-slate-500">
                                        +{dayMeetings.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Calendar" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        {/* Google Connection Status */}
                        <div className="mb-6">
                            <GoogleConnectionStatus
                                onConnectionChange={(connected) => setGoogleConnected(connected)}
                            />
                        </div>

                        {!isClient || !currentDate || !selectedDate ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-2" />
                                <span className="text-slate-600">Loading calendar...</span>
                            </div>
                        ) : (
                            <>
                                {/* Calendar Header */}
                                <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => navigateDate('prev')}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <h1 className="text-xl font-bold text-slate-900">
                                                    {currentDate.toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </h1>
                                                <button
                                                    onClick={() => navigateDate('next')}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const today = new Date();
                                                    setCurrentDate(today);
                                                    setSelectedDate(today);
                                                }}
                                                className="px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                Today
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {/* Search */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search meetings..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 pr-4 py-2 text-sm text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* View Mode Selector */}
                                            <div className="flex bg-slate-100 rounded-lg p-1">
                                                {(['month', 'list'] as ViewMode[]).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setViewMode(mode)}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${viewMode === mode
                                                                ? 'bg-white text-slate-900 shadow-sm'
                                                                : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Create Meeting Button */}
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                New Meeting
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Calendar View */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                                            {viewMode === 'month' ? (
                                                <div>
                                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                                        Calendar View
                                                    </h2>
                                                    {renderCalendarGrid()}
                                                </div>
                                            ) : (
                                                <div>
                                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                                        Meeting List
                                                    </h2>
                                                    {loading ? (
                                                        <div className="flex items-center justify-center py-12">
                                                            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                                                            <span className="text-slate-600">Loading meetings...</span>
                                                        </div>
                                                    ) : sortedFilteredMeetings.length === 0 ? (
                                                        <div className="text-center py-12">
                                                            <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                            <p className="text-slate-600">No meetings found</p>
                                                            <p className="text-sm text-slate-500 mt-1">
                                                                {searchTerm ? 'Try adjusting your search' : 'Create your first meeting to get started'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {sortedFilteredMeetings.map((meeting) => {
                                                                const meetingDate = new Date(meeting.start);
                                                                const isToday = meetingDate.toDateString() === new Date().toDateString();
                                                                const isPast = meetingDate < new Date();

                                                                return (
                                                                    <div
                                                                        key={meeting.id}
                                                                        className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${isPast ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'
                                                                            } ${isToday ? 'ring-2 ring-emerald-200 border-emerald-300' : ''}`}
                                                                        onClick={() => setSelectedMeeting(meeting)}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center space-x-2 mb-2">
                                                                                    <h3 className={`font-semibold ${isPast ? 'text-slate-600' : 'text-slate-900'}`}>
                                                                                        {meeting.summary}
                                                                                    </h3>
                                                                                    {isToday && (
                                                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                                                            Today
                                                                                        </span>
                                                                                    )}
                                                                                    {isPast && (
                                                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                                                                            Past
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {meeting.description && (
                                                                                    <p className={`text-sm mb-3 ${isPast ? 'text-slate-500' : 'text-slate-600'}`}>
                                                                                        {meeting.description}
                                                                                    </p>
                                                                                )}

                                                                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                                                                    <div className="flex items-center">
                                                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                                                        {meetingDate.toLocaleDateString('en-US', {
                                                                                            weekday: 'short',
                                                                                            month: 'short',
                                                                                            day: 'numeric'
                                                                                        })}
                                                                                    </div>
                                                                                    <div className="flex items-center">
                                                                                        <Clock className="h-4 w-4 mr-1" />
                                                                                        {formatTimeRange(meeting.start, meeting.end)}
                                                                                    </div>
                                                                                    {meeting.attendees && meeting.attendees.length > 0 && (
                                                                                        <div className="flex items-center">
                                                                                            <Users className="h-4 w-4 mr-1" />
                                                                                            {meeting.attendees.length} participant{meeting.attendees.length !== 1 ? 's' : ''}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center space-x-2 ml-4">
                                                                                {meeting.meetLink && (
                                                                                    <a
                                                                                        href={meeting.meetLink}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isPast
                                                                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                                            }`}
                                                                                    >
                                                                                        <Video className="h-4 w-4 mr-1" />
                                                                                        {isPast ? 'Recording' : 'Join'}
                                                                                    </a>
                                                                                )}

                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedMeeting(meeting);
                                                                                    }}
                                                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                                                    title="View details"
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sidebar */}
                                    <div className="space-y-6">
                                        {/* Selected Date Info */}
                                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                                            <h3 className="font-semibold text-slate-900 mb-3">
                                                {formatDate(selectedDate)}
                                            </h3>
                                            <div className="space-y-2">
                                                {getLocalMeetingsForDate(selectedDate).length === 0 ? (
                                                    <p className="text-sm text-slate-500">No meetings scheduled</p>
                                                ) : (
                                                    getLocalMeetingsForDate(selectedDate).map((meeting) => (
                                                        <div
                                                            key={meeting.id}
                                                            className="text-sm p-2 bg-emerald-50 rounded border-l-2 border-emerald-500"
                                                        >
                                                            <div className="font-medium text-slate-900">{meeting.summary}</div>
                                                            <div className="text-slate-600 text-xs">
                                                                {formatTimeRange(meeting.start, meeting.end)}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                                            <h3 className="font-semibold text-slate-900 mb-3">Quick Stats</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Today's Meetings</span>
                                                    <span className="font-medium">{getLocalMeetingsForDate(new Date()).length}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">This Month</span>
                                                    <span className="font-medium">{allMeetings.length}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">With Meet Links</span>
                                                    <span className="font-medium">
                                                        {allMeetings.filter(m => m.meetLink).length}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Upcoming</span>
                                                    <span className="font-medium">
                                                        {allMeetings.filter(m => new Date(m.start) > new Date()).length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Create Meeting Modal */}
                                {showCreateModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-lg font-semibold text-slate-900">Create New Meeting</h2>
                                                    <button
                                                        onClick={() => setShowCreateModal(false)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>

                                                <form onSubmit={handleCreateMeeting} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                                            Title *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newMeeting.title}
                                                            onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                                                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={newMeeting.description}
                                                            onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                                                            rows={3}
                                                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                Start Time *
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                value={newMeeting.startTime}
                                                                onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                                                                className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                End Time *
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                value={newMeeting.endTime}
                                                                onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                                                                className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                                            Participants
                                                        </label>
                                                        <div className="space-y-2">
                                                            {newMeeting.participants.map((email, index) => (
                                                                <div key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                                                                    <span className="text-sm">{email}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeParticipant(email)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="email"
                                                                    value={newMeeting.newParticipant}
                                                                    onChange={(e) => setNewMeeting(prev => ({ ...prev, newParticipant: e.target.value }))}
                                                                    placeholder="Add participant email..."
                                                                    className="flex-1 px-3 py-2 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={addParticipant}
                                                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end space-x-3 pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCreateModal(false)}
                                                            className="px-4 py-2 text-slate-600 hover:text-slate-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={createLoading}
                                                            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center"
                                                        >
                                                            {createLoading ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Creating...
                                                                </>
                                                            ) : (
                                                                'Create Meeting'
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Meeting Details Modal */}
                                {selectedMeeting && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-lg max-w-lg w-full">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-lg font-semibold text-slate-900">Meeting Details</h2>
                                                    <button
                                                        onClick={() => setSelectedMeeting(null)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 text-lg">
                                                            {selectedMeeting.summary}
                                                        </h3>
                                                        {selectedMeeting.description && (
                                                            <p className="text-slate-600 mt-2">{selectedMeeting.description}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center text-slate-600">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {formatTimeRange(selectedMeeting.start, selectedMeeting.end)}
                                                    </div>

                                                    {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center text-slate-600 mb-2">
                                                                <Users className="h-4 w-4 mr-2" />
                                                                Participants ({selectedMeeting.attendees.length})
                                                            </div>
                                                            <div className="space-y-1">
                                                                {selectedMeeting.attendees.map((attendee, index) => (
                                                                    <div key={index} className="text-sm text-slate-700 bg-slate-50 px-3 py-1 rounded">
                                                                        {attendee.displayName || attendee.email}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedMeeting.meetLink && (
                                                        <div className="pt-4 border-t flex items-center justify-between">
                                                            <a
                                                                href={selectedMeeting.meetLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                                            >
                                                                <Video className="h-4 w-4 mr-2" />
                                                                Join Meeting
                                                                <ExternalLink className="h-4 w-4 ml-2" />
                                                            </a>

                                                            <button
                                                                onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                                                className="inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete meeting"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                                <div className="flex items-center">
                                    <div className="text-sm text-red-700">{error}</div>
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-3 text-red-400 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}









