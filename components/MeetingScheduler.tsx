'use client';

import { useState } from 'react';
import { Calendar, Loader2, X, Plus, UserPlus } from 'lucide-react';
import { createCalendarMeeting } from '../app/services/calendarService';
import { LeadDetails } from '../app/services/leadsService';

interface MeetingSchedulerProps {
    lead: LeadDetails;
    onMeetingCreated: (meetLink: string) => void;
    onError: (error: string) => void;
}

export default function MeetingScheduler({ lead, onMeetingCreated, onError }: MeetingSchedulerProps) {
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingDescription, setMeetingDescription] = useState('');
    const [meetingStart, setMeetingStart] = useState('');
    const [meetingEnd, setMeetingEnd] = useState('');
    const [participants, setParticipants] = useState<string[]>(lead.email ? [lead.email] : []);
    const [newParticipant, setNewParticipant] = useState('');
    const [meetingLoading, setMeetingLoading] = useState(false);
    const [clearLeadFields, setClearLeadFields] = useState(true);
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const addParticipant = () => {
        const email = newParticipant.trim();

        if (!email) {
            setValidationError('Please enter an email address');
            return;
        }

        if (!validateEmail(email)) {
            setValidationError('Please enter a valid email address');
            return;
        }

        if (participants.includes(email)) {
            setValidationError('This email is already added');
            return;
        }

        setParticipants([...participants, email]);
        setNewParticipant('');
        setValidationError(null);
    };

    const removeParticipant = (email: string) => {
        setParticipants(participants.filter(p => p !== email));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!meetingStart || !meetingEnd) {
            onError('Please select start and end times');
            return;
        }

        if (new Date(meetingEnd) <= new Date(meetingStart)) {
            onError('End time must be after start time');
            return;
        }

        try {
            setMeetingLoading(true);
            onError('');

            const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const response = await createCalendarMeeting({
                title: meetingTitle || `Meeting with ${lead.name}`,
                description: meetingDescription,
                startTime: new Date(meetingStart).toISOString(),
                endTime: new Date(meetingEnd).toISOString(),
                participants: participants,
                timeZone: browserTz,
                leadId: lead.id,
                clearLeadFields: clearLeadFields
            } as any);

            onMeetingCreated(response.data.meetLink);

            // Reset form
            setMeetingTitle('');
            setMeetingDescription('');
            setMeetingStart('');
            setMeetingEnd('');
            setParticipants(lead.email ? [lead.email] : []);
            setNewParticipant('');
        } catch (err: any) {
            console.error('Failed to create meeting:', err);
            onError(
                err.response?.data?.message ||
                'Failed to create meeting. Please try again.'
            );
        } finally {
            setMeetingLoading(false);
        }
    };

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Meeting Title
                </label>
                <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder={`Meeting with ${lead.name}`}
                    className="w-full px-3 py-2 text-xs text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Description (Optional)
                </label>
                <textarea
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                    rows={2}
                    placeholder="Add meeting agenda or notes..."
                    className="w-full px-3 py-2 text-xs border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                        Start Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={meetingStart}
                        onChange={(e) => setMeetingStart(e.target.value)}
                        className="w-full px-3 py-2 text-xs text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                        End Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={meetingEnd}
                        onChange={(e) => setMeetingEnd(e.target.value)}
                        className="w-full px-3 py-2 text-xs border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 flex items-center">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Participants ({participants.length})
                </label>

                {/* Participant List */}
                {participants.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {participants.map((email, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                            >
                                <span className="text-xs text-slate-700 truncate flex-1">{email}</span>
                                <button
                                    type="button"
                                    onClick={() => removeParticipant(email)}
                                    className="ml-2 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Remove participant"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Participant Input */}
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={newParticipant}
                        onChange={(e) => {
                            setNewParticipant(e.target.value);
                            setValidationError(null);
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addParticipant();
                            }
                        }}
                        placeholder="Add participant email..."
                        className="flex-1 px-3 py-2 text-xs border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={addParticipant}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center"
                        title="Add participant"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>

                {validationError && (
                    <p className="text-xs text-red-600">{validationError}</p>
                )}

                <p className="text-xs text-slate-500">
                    Press Enter or click + to add each email
                </p>
            </div>

            {/* Clear Lead Fields Option */}
            <div className="flex items-center space-x-2 pt-2">
                <input
                    type="checkbox"
                    id="clearLeadFields"
                    checked={clearLeadFields}
                    onChange={(e) => setClearLeadFields(e.target.checked)}
                    className="h-3 w-3 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="clearLeadFields" className="text-xs text-slate-600">
                    Update lead status to "Contacted" after meeting creation
                </label>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={meetingLoading || !meetingStart || !meetingEnd}
                className="w-full mt-3 inline-flex items-center justify-center px-4 py-2.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
                {meetingLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Meeting...
                    </>
                ) : (
                    <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Google Meet ({participants.length} {participants.length === 1 ? 'participant' : 'participants'})
                    </>
                )}
            </button>
        </form>
    );
}
