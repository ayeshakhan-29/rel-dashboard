import api from './api';

export interface RevenueTrendData {
    month: string;
    revenue: number;
    leads: number;
}

export interface ConversionFunnelData {
    name: string;
    value: number;
    color: string;
}

export interface PerformanceMetric {
    metric: string;
    value: string;
    target: string;
    progress: number;
}

export interface PipelineDistributionData {
    name: string;
    value: number;
    color: string;
}

export interface AnalyticsOverview {
    revenueTrend: RevenueTrendData[];
    conversionFunnel: ConversionFunnelData[];
    performanceMetrics: PerformanceMetric[];
    pipelineDistribution: PipelineDistributionData[];
}

class AnalyticsService {
    /**
     * Get revenue and leads trend data
     */
    async getRevenueTrend(months: number = 6): Promise<RevenueTrendData[]> {
        const response = await api.get('/analytics/revenue-trend', {
            params: { months }
        });
        return response.data.data;
    }

    /**
     * Get conversion funnel data
     */
    async getConversionFunnel(): Promise<ConversionFunnelData[]> {
        const response = await api.get('/analytics/conversion-funnel');
        return response.data.data;
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
        const response = await api.get('/analytics/performance');
        return response.data.data;
    }

    /**
     * Get pipeline distribution
     */
    async getPipelineDistribution(): Promise<PipelineDistributionData[]> {
        const response = await api.get('/analytics/pipeline-distribution');
        return response.data.data;
    }

    /**
     * Get all analytics data in one call (overview)
     */
    async getOverview(months: number = 6): Promise<AnalyticsOverview> {
        const response = await api.get('/analytics/overview', {
            params: { months }
        });
        return response.data.data;
    }
}

export default new AnalyticsService();
