import api from './api';

export interface CreateMeetingPayload {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    participants: string[];
    timeZone?: string;
    leadId?: number;
    clearLeadFields?: boolean;
}

export interface MeetingDetails {
    eventId: string;
    meetLink: string;
    startTime: string;
    endTime: string;
    title?: string;
    description?: string;
    attendees?: Array<{email: string}>;
    status?: string;
    leadUpdated?: boolean;
    participantCount?: number;
}

export interface CreateMeetingResponse {
    success: boolean;
    message: string;
    data: MeetingDetails;
}

export interface CalendarMeeting {
    id: string;
    summary: string;
    description?: string;
    start: string;
    end: string;
    meetLink?: string;
    attendees?: Array<{email: string, displayName?: string}>;
    location?: string;
    status?: string;
}

export interface MeetingsResponse {
    success: boolean;
    message: string;
    data: {
        meetings: CalendarMeeting[];
    };
}

/**
 * Create a calendar meeting and return Google Meet details.
 */
export const createCalendarMeeting = async (
    payload: CreateMeetingPayload
): Promise<CreateMeetingResponse> => {
    const response = await api.post('/calendar/meeting', payload);
    return response.data as CreateMeetingResponse;
};

/**
 * Get meetings for a specific date
 */
export const getMeetingsForDate = async (date: string, timeZone?: string): Promise<MeetingsResponse> => {
    const response = await api.get('/calendar/meetings', {
        params: { 
            date, 
            timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone 
        }
    });
    return response.data as MeetingsResponse;
};

/**
 * Get all upcoming meetings (next 30 days)
 */
export const getAllUpcomingMeetings = async (): Promise<MeetingsResponse> => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // Next 30 days
    
    const response = await api.get('/calendar/meetings', {
        params: { 
            date: today.toISOString().split('T')[0],
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    });
    return response.data as MeetingsResponse;
};

/**
 * Delete a calendar meeting
 */
export const deleteCalendarMeeting = async (eventId: string): Promise<{success: boolean, message: string}> => {
    const response = await api.delete(`/calendar/meeting/${eventId}`);
    return response.data;
};









