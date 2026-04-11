'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BarChart3,
    Users,
    DollarSign,
    ArrowRight,
    Activity,
} from 'lucide-react';
import KPICard from '@/components/KPICard';
import dashboardService, { DashboardKPI } from '@/app/services/dashboardService';
import analyticsService, { PerformanceMetric } from '@/app/services/analyticsService';
import reservationService from '@/app/services/reservationService';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    pending_driver_approval: 'bg-violet-100 text-violet-700',
    assigned: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    driver_denied: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
    const [kpis, setKpis] = useState<DashboardKPI[]>([]);
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [kpisLoading, setKpisLoading] = useState(true);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(true);

    // Fetch KPIs from API
    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                setKpisLoading(true);
                const data = await dashboardService.getKPIs();
                setKpis(data);
            } catch (err) {
                console.error('Failed to fetch KPIs:', err);
            } finally {
                setKpisLoading(false);
            }
        };

        fetchKPIs();
    }, []);




    // Fetch performance metrics from API
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setMetricsLoading(true);
                const data = await analyticsService.getPerformanceMetrics();
                setPerformanceMetrics(data);
            } catch (err) {
                console.error('Failed to fetch performance metrics:', err);
            } finally {
                setMetricsLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    // Fetch recent trip activity
    useEffect(() => {
        reservationService.getRecentActivity(8)
            .then(setRecentActivity)
            .catch(() => setRecentActivity([]))
            .finally(() => setActivityLoading(false));
    }, []);



    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpisLoading ? (
                    <div className="col-span-4 text-center py-8 text-slate-600">
                        Loading dashboard metrics...
                    </div>
                ) : (
                    kpis.map((kpi, index) => (
                        <KPICard
                            key={index}
                            title={kpi.title}
                            value={kpi.value}
                            change={kpi.change}
                            trend={kpi.trend}
                            icon={
                                kpi.title.includes('Bookings')
                                    ? Users
                                    : kpi.title.includes('Revenue')
                                        ? DollarSign
                                        : kpi.title.includes('Clients')
                                            ? Users
                                            : BarChart3
                            }
                        />
                    ))
                )}
            </div>


            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <Link
                    href="/admin/analytics"
                    className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Analytics</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View insights</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Performance Metrics, Tasks & Trip Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Performance Metrics</h3>
                        <Link
                            href="/admin/analytics"
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-semibold"
                        >
                            View analytics
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {metricsLoading ? (
                            <p className="text-sm text-slate-500">Loading metrics...</p>
                        ) : performanceMetrics.length === 0 ? (
                            <p className="text-sm text-slate-500">No metrics available</p>
                        ) : (
                            performanceMetrics.map((metric, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{metric.metric}</p>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{metric.value}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">/ {metric.target}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${metric.progress >= 90 ? 'bg-green-500' :
                                                    metric.progress >= 70 ? 'bg-blue-500' :
                                                        metric.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${Math.min(metric.progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{metric.progress}% of target</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                {/* Recent Trip Activity */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Trip Activity
                        </h3>
                        <Link href="/reservations" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-semibold">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activityLoading ? (
                            <p className="text-sm text-slate-500">Loading activity...</p>
                        ) : recentActivity.length === 0 ? (
                            <p className="text-sm text-slate-500">No recent activity</p>
                        ) : (
                            recentActivity.map((log) => (
                                <Link
                                    key={log.id}
                                    href={`/reservations/${log.reservation_id}`}
                                    className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                                            #{log.reservation_number} — {log.passenger_name}
                                        </span>
                                        <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[log.to_status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                            {log.to_status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        by {log.changed_by_name} · {new Date(log.created_at).toLocaleString()}
                                    </p>
                                    {log.note && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5 truncate">"{log.note}"</p>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
