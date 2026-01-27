import api from './api';

export interface Lead {
    id: number | string;
    name: string;
    phone: string;
    email?: string;
    stage: 'New' | 'Incoming' | 'Contacted' | 'Qualified' | 'Proposal' | 'Second Wing' | 'Won' | 'Lost';
    source: 'WhatsApp' | 'Website' | 'Referral' | 'Cold Call' | 'Email' | 'Social Media' | 'Other';
    last_message?: string;
    last_message_at?: string;
    created_at: string;
    updated_at: string;
}

export interface LeadMessage {
    id: number | string;
    lead_id: number | string;
    message_id: string;
    direction: 'inbound' | 'outbound';
    message_text: string;
    message_type: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    created_at: string;
}

export interface LeadTimeline {
    id: number | string;
    lead_id: number | string;
    event_type: 'message_received' | 'message_sent' | 'stage_changed' | 'note_added' | 'call_made' | 'email_sent';
    description: string;
    metadata?: any;
    created_at: string;
}

export interface LeadDetails extends Lead {
    messages: LeadMessage[];
    timeline: LeadTimeline[];
}

export interface LeadsResponse {
    success: boolean;
    data: {
        leads: Lead[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface LeadDetailsResponse {
    success: boolean;
    lead: LeadDetails;
}

export interface SendMessageResponse {
    success: boolean;
    message: string;
    data: {
        messageId: string;
        to: string;
    };
}

/**
 * Get all leads with optional filters
 */
export const getLeads = async (params?: {
    page?: number;
    limit?: number;
    stage?: string;
    source?: string;
}): Promise<LeadsResponse> => {
    const response = await api.get('/leads', { params });
    return response.data;
};

/**
 * Get single lead details with messages and timeline
 */
export const getLeadDetails = async (id: number | string): Promise<LeadDetailsResponse> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
};

/**
 * Send WhatsApp message to a lead
 */
export const sendWhatsAppMessage = async (data: {
    leadId: number | string;
    phone: string;
    message: string;
}): Promise<SendMessageResponse> => {
    const response = await api.post('/whatsapp/send', data);
    return {
        success: response.data.success,
        message: response.data.message,
        data: {
            messageId: response.data.messageId,
            to: data.phone
        }
    };
};

/**
 * Create a new lead
 */
export interface CreateLeadData {
    name: string;
    email?: string;
    phone: string;
    company?: string;
    stage?: string;
    source?: string;
    priority?: string;
    value?: string;
}

export interface CreateLeadResponse {
    success: boolean;
    message: string;
    data: LeadDetails;
}

export const createLead = async (data: CreateLeadData): Promise<CreateLeadResponse> => {
    const response = await api.post('/leads', data);
    return response.data;
};

/**
 * Update a lead
 */
export const updateLead = async (id: number | string, data: Partial<CreateLeadData>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
};

/**
 * Delete a lead
 */
export const deleteLead = async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
};
