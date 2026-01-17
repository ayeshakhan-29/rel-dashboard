import api from './api';

export interface DashboardKPI {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}

export interface PipelineStageCount {
    stage: string;
    count: number;
    name: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

export interface DashboardTask {
    id: number;
    title: string;
    description: string;
    dueDate: string | null;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    leadId: number | null;
    leadName: string;
}



export interface DashboardStats {
    totalLeads: number;
    revenue: number;
    conversionRate: number;
    activeDeals: number;
    pipelineStages: PipelineStageCount[];
    recentLeadsCount: number;
    wonLeadsThisMonth: number;
    lostLeadsThisMonth: number;
}

class DashboardService {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get('/dashboard/stats');
        return response.data.data;
    }

    /**
     * Get KPIs for dashboard cards
     */
    async getKPIs(): Promise<DashboardKPI[]> {
        const response = await api.get('/dashboard/kpis');
        return response.data.data;
    }

    /**
     * Get pipeline stage counts for dashboard overview
     */
    async getPipelineOverview(): Promise<PipelineStageCount[]> {
        const response = await api.get('/dashboard/pipeline-overview');
        return response.data.data;
    }

    /**
     * Get upcoming tasks for dashboard
     */
    async getUpcomingTasks(limit: number = 5): Promise<DashboardTask[]> {
        const response = await api.get('/dashboard/upcoming-tasks', {
            params: { limit }
        });
        return response.data.data;
    }


}

export default new DashboardService();
