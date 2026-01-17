import api from './api';

export interface Lead {
    id: number;
    name: string;
    phone: string;
    email: string;
    stage: string;
    source: string;
    last_message: string;
    last_message_at: string;
    created_at: string;
    updated_at: string;
}

export interface PipelineStage {
    stage: string;
    count: number;
    leads: Lead[];
}

export interface PipelineStats {
    stage: string;
    count: number;
    today_count: number;
    week_count: number;
}

class PipelineService {
    /**
     * Get pipeline data - leads grouped by stage
     */
    async getPipelineData(): Promise<PipelineStage[]> {
        const response = await api.get('/pipeline');
        return response.data.data;
    }

    /**
     * Update lead stage (for drag-and-drop)
     */
    async updateLeadStage(leadId: number, stage: string): Promise<void> {
        await api.patch(`/pipeline/leads/${leadId}/stage`, { stage });
    }

    /**
     * Get pipeline statistics
     */
    async getPipelineStats(): Promise<PipelineStats[]> {
        const response = await api.get('/pipeline/stats');
        return response.data.data;
    }
}

export default new PipelineService();
