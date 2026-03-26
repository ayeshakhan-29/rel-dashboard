import api from './api';
import reservationService from './reservationService';

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
     * Get KPIs for dashboard cards - Integrated with Reservation API
     */
    async getKPIs(): Promise<DashboardKPI[]> {
        try {
            const stats = await reservationService.getReservationStats();
            
            // Calculate changes (mock data for now - you can enhance this)
            return [
                {
                    title: 'Total Bookings',
                    value: stats.total.toString(),
                    change: '+12%',
                    trend: 'up'
                },
                {
                    title: 'Today\'s Bookings',
                    value: stats.today.toString(),
                    change: stats.today > 0 ? '+2' : '0',
                    trend: stats.today > 0 ? 'up' : 'down'
                },
                {
                    title: 'Active Trips',
                    value: (stats.by_status.find((s: { status: string }) => s.status === 'in_progress')?.count || 0).toString(),
                    change: '3 ongoing',
                    trend: 'up'
                },
                {
                    title: 'Pending Assignments',
value: (stats.by_status.find((s: { status: string }) => s.status === 'pending')?.count || 0).toString(),                    change: 'Need dispatch',
trend: stats.by_status.find((s: { status: string }) => s.status === 'pending')?.count ? 'up' : 'down'                }
            ];
        } catch (error) {
            console.error('Failed to fetch KPIs from reservation API:', error);
            // Fallback to default KPIs
            return [
                { title: 'Total Bookings', value: '0', change: '0%', trend: 'up' },
                { title: 'Today\'s Bookings', value: '0', change: '0', trend: 'up' },
                { title: 'Active Trips', value: '0', change: '0', trend: 'up' },
                { title: 'Pending Assignments', value: '0', change: '0', trend: 'up' }
            ];
        }
    }

    /**
     * Get pipeline stage counts - Map reservation status to pipeline stages
     */
    async getPipelineOverview(): Promise<PipelineStageCount[]> {
        try {
            const stats = await reservationService.getReservationStats();
            
            // Map reservation status to pipeline stages with styling
            const statusMap: Record<string, PipelineStageCount> = {
                'pending': {
                    stage: 'pending',
count: (stats.by_status.find((s: { status: string }) => s.status === 'pending')?.count || 0).toString(),                    name: 'Pending',
                    bgColor: 'bg-amber-100',
                    textColor: 'text-amber-800',
                    borderColor: 'border-amber-200'
                },
                'assigned': {
                    stage: 'assigned',
count: (stats.by_status.find((s: { status: string }) => s.status === 'assigned')?.count || 0).toString(),                    name: 'Assigned',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-200'
                },
                'in_progress': {
                    stage: 'in_progress',
count: (stats.by_status.find((s: { status: string }) => s.status === 'in_progress')?.count || 0).toString(),                    name: 'In Progress',
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    borderColor: 'border-purple-200'
                },
                'completed': {
                    stage: 'completed',
count: (stats.by_status.find((s: { status: string }) => s.status === 'completed')?.count || 0).toString(),                    name: 'Completed',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200'
                },
                'cancelled': {
                    stage: 'cancelled',
count: (stats.by_status.find((s: { status: string }) => s.status === 'cancelled')?.count || 0).toString(),                    name: 'Cancelled',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200'
                }
            };
            
            return Object.values(statusMap);
        } catch (error) {
            console.error('Failed to fetch pipeline overview:', error);
            return [];
        }
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

    /**
     * Get recent form submissions from reservation API
     */
    async getRecentFormSubmissions(limit: number = 5): Promise<any[]> {
        try {
            const reservations = await reservationService.getRecentFormSubmissions();
            
            return reservations.map(res => ({
                id: res.id,
                name: res.passenger_name,
                phone: res.passenger_phone,
                email: res.passenger_email,
                date: res.created_at,
                pickup: res.pickup_location,
                dropoff: res.dropoff_location,
                status: res.reservation_status
            }));
        } catch (error) {
            console.error('Failed to fetch recent form submissions:', error);
            return [];
        }
    }
}

export default new DashboardService();