/**
 * RingCentral Service
 * 
 * Frontend service for interacting with RingCentral APIs
 */

import api from './api';

// ============================================
// AUTHENTICATION
// ============================================

export interface RingCentralStatus {
    connected: boolean;
    account?: {
        name: string;
        id: string;
    };
    extension?: {
        name: string;
        extensionNumber: string;
    };
    message?: string;
}

export const ringcentralAuth = {
    /**
     * Get authorization URL
     */
    getAuthUrl: async (): Promise<{ authUrl: string }> => {
        const response = await api.get('/auth/ringcentral');
        return response.data;
    },

    /**
     * Get connection status
     */
    getStatus: async (): Promise<RingCentralStatus> => {
        const response = await api.get('/auth/ringcentral/status');
        return response.data;
    },

    /**
     * Disconnect RingCentral account
     */
    disconnect: async (): Promise<void> => {
        await api.delete('/auth/ringcentral/disconnect');
    }
};

// ============================================
// CALLS
// ============================================

export interface Call {
    id: number;
    call_id: string;
    direction: 'Inbound' | 'Outbound';
    from_number: string;
    to_number: string;
    status: string;
    duration: number;
    start_time: string;
    end_time?: string;
    recording_url?: string;
}

export interface MakeCallRequest {
    to: string;
    from?: string;
}

export const ringcentralCalls = {
    /**
     * Make an outbound call
     */
    makeCall: async (data: MakeCallRequest): Promise<{ call: Call }> => {
        const response = await api.post('/api/ringcentral/calls', data);
        return response.data;
    },

    /**
     * Get call history
     */
    getCallHistory: async (limit = 50, offset = 0): Promise<{ calls: Call[]; total: number }> => {
        const response = await api.get(`/api/ringcentral/calls?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    /**
     * Get call details
     */
    getCallDetails: async (callId: string): Promise<{ call: Call }> => {
        const response = await api.get(`/api/ringcentral/calls/${callId}`);
        return response.data;
    }
};

// ============================================
// MESSAGES (SMS/MMS)
// ============================================

export interface Message {
    id: number;
    message_id: string;
    direction: 'Inbound' | 'Outbound';
    from_number: string;
    to_number: string;
    subject?: string;
    message_text: string;
    message_type: 'SMS' | 'MMS';
    attachment_count: number;
    read_status: 'Read' | 'Unread';
    created_at: string;
}

export interface SendSMSRequest {
    to: string;
    text: string;
    from?: string;
}

export interface Attachment {
    filename: string;
    contentType: string;
    content: string; // Base64 encoded
    size?: number;
}

export interface SendMMSRequest {
    to: string;
    text?: string;
    attachments: Attachment[];
    from?: string;
}

export const ringcentralMessages = {
    /**
     * Send SMS
     */
    sendSMS: async (data: SendSMSRequest): Promise<{ messageData: any }> => {
        const response = await api.post('/api/ringcentral/messages/sms', data);
        return response.data;
    },

    /**
     * Send MMS
     */
    sendMMS: async (data: SendMMSRequest): Promise<{ messageData: any }> => {
        const response = await api.post('/api/ringcentral/messages/mms', data);
        return response.data;
    },

    /**
     * Get messages
     */
    getMessages: async (limit = 50, offset = 0, direction?: 'Inbound' | 'Outbound'): Promise<{ messages: Message[]; total: number }> => {
        let url = `/api/ringcentral/messages?limit=${limit}&offset=${offset}`;
        if (direction) {
            url += `&direction=${direction}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    /**
     * Get message details
     */
    getMessageDetails: async (messageId: string): Promise<{ message: Message; attachments: any[] }> => {
        const response = await api.get(`/api/ringcentral/messages/${messageId}`);
        return response.data;
    }
};

// ============================================
// TEAM MESSAGING
// ============================================

export interface Team {
    id: string;
    name: string;
    description?: string;
    members?: any[];
    type?: string;
}

export interface TeamMessage {
    id: number;
    message_id: string;
    group_id: string;
    group_name: string;
    sender_id: string;
    sender_name: string;
    message_text: string;
    message_type: string;
    attachments?: any;
    created_at: string;
}

export interface SendTeamMessageRequest {
    text: string;
    attachments?: Attachment[];
}

export const ringcentralTeams = {
    /**
     * Get teams
     */
    getTeams: async (): Promise<{ teams: Team[] }> => {
        const response = await api.get('/api/ringcentral/teams');
        return response.data;
    },

    /**
     * Get team details
     */
    getTeamDetails: async (groupId: string): Promise<{ team: Team }> => {
        const response = await api.get(`/api/ringcentral/teams/${groupId}`);
        return response.data;
    },

    /**
     * Send team message
     */
    sendTeamMessage: async (groupId: string, data: SendTeamMessageRequest): Promise<{ messageData: any }> => {
        const response = await api.post(`/api/ringcentral/teams/${groupId}/messages`, data);
        return response.data;
    },

    /**
     * Get team messages
     */
    getTeamMessages: async (groupId: string, limit = 50, recordId?: string): Promise<{ messages: TeamMessage[]; navigation: any }> => {
        let url = `/api/ringcentral/teams/${groupId}/messages?limit=${limit}`;
        if (recordId) {
            url += `&recordId=${recordId}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    /**
     * Get all team messages
     */
    getAllTeamMessages: async (limit = 50, offset = 0): Promise<{ messages: TeamMessage[]; total: number }> => {
        const response = await api.get(`/api/ringcentral/teams/messages/all?limit=${limit}&offset=${offset}`);
        return response.data;
    }
};

// ============================================
// VIDEO MEETINGS
// ============================================

export interface Meeting {
    id: number;
    meeting_id: string;
    topic: string;
    start_time?: string;
    duration: number;
    join_url: string;
    host_join_url: string;
    password?: string;
    status: string;
    participant_count: number;
    created_at: string;
}

export interface CreateMeetingRequest {
    topic: string;
    startTime?: string;
    duration?: number;
    password?: string;
}

export const ringcentralMeetings = {
    /**
     * Create meeting
     */
    createMeeting: async (data: CreateMeetingRequest): Promise<{ meeting: Meeting }> => {
        const response = await api.post('/api/ringcentral/meetings', data);
        return response.data;
    },

    /**
     * Get meetings
     */
    getMeetings: async (limit = 50, offset = 0): Promise<{ meetings: Meeting[]; total: number }> => {
        const response = await api.get(`/api/ringcentral/meetings?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    /**
     * Get meeting details
     */
    getMeetingDetails: async (meetingId: string): Promise<{ meeting: Meeting }> => {
        const response = await api.get(`/api/ringcentral/meetings/${meetingId}`);
        return response.data;
    },

    /**
     * Delete meeting
     */
    deleteMeeting: async (meetingId: string): Promise<void> => {
        await api.delete(`/api/ringcentral/meetings/${meetingId}`);
    }
};

