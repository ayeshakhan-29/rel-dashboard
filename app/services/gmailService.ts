import api from './api';

export interface Email {
    id: string;
    threadId: string;
    snippet: string;
    subject: string;
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    date: string;
    internalDate: string;
    labels: string[];
    bodyText: string;
    bodyHtml: string;
    attachments?: Array<{
        filename: string;
        mimeType: string;
        size?: number;
    }>;
}

export interface EmailListResponse {
    success: boolean;
    message: string;
    data: {
        emails: Email[];
        nextPageToken?: string;
        resultSizeEstimate: number;
        count: number;
    };
}

export interface EmailResponse {
    success: boolean;
    message: string;
    data: Email;
}

export interface Label {
    id: string;
    name: string;
    type: string;
    messageListVisibility?: string;
    labelListVisibility?: string;
}

export interface LabelsResponse {
    success: boolean;
    message: string;
    data: Label[];
}

/**
 * List emails from Gmail
 */
export const listEmails = async (
    maxResults: number = 50,
    query: string = '',
    pageToken?: string
): Promise<EmailListResponse> => {
    const params: any = {
        maxResults,
    };
    
    if (query) {
        params.query = query;
    }
    
    if (pageToken) {
        params.pageToken = pageToken;
    }
    
    const response = await api.get('/gmail/emails', { params });
    return response.data as EmailListResponse;
};

/**
 * Get email by ID
 */
export const getEmailById = async (id: string): Promise<EmailResponse> => {
    const response = await api.get(`/gmail/emails/${id}`);
    return response.data as EmailResponse;
};

/**
 * Get email labels
 */
export const getLabels = async (): Promise<LabelsResponse> => {
    const response = await api.get('/gmail/labels');
    return response.data as LabelsResponse;
};

