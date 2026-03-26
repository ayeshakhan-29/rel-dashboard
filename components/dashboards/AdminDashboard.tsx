'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BarChart3,
    Users,
    DollarSign,
    TrendingUp,
    ArrowRight,
    Car,
    Clock,
    MapPin
} from 'lucide-react';
import KPICard from '@/components/KPICard';
import TaskCard from '@/components/TaskCard';
import { Task, Lead } from '@/types';
import dashboardService, { DashboardKPI, DashboardTask } from '@/app/services/dashboardService';
import analyticsService, { PerformanceMetric } from '@/app/services/analyticsService';
import reservationService from '@/app/services/reservationService';
import { Reservation } from '@/types/reservation.types';
export default function AdminDashboard() {
    const [recentForms, setRecentForms] = useState<any[]>([]);
    const [kpis, setKpis] = useState<DashboardKPI[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[]>([]);
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
    const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState({
        kpis: true,
        forms: true,
        tasks: true,
        metrics: true,
        reservations: true
    });

    // Fetch all dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch KPIs
                setLoading(prev => ({ ...prev, kpis: true }));
                const kpiData = await dashboardService.getKPIs();
                setKpis(kpiData);
            } catch (err) {
                console.error('Failed to fetch KPIs:', err);
            } finally {
                setLoading(prev => ({ ...prev, kpis: false }));
            }

            try {
                // Fetch recent form submissions
                setLoading(prev => ({ ...prev, forms: true }));
                const formData = await dashboardService.getRecentFormSubmissions(5);
                setRecentForms(formData);
            } catch (err) {
                console.error('Failed to fetch recent forms:', err);
            } finally {
                setLoading(prev => ({ ...prev, forms: false }));
            }

            try {
                // Fetch upcoming tasks
                setLoading(prev => ({ ...prev, tasks: true }));
                const taskData = await dashboardService.getUpcomingTasks(3);
                setUpcomingTasks(taskData);
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            } finally {
                setLoading(prev => ({ ...prev, tasks: false }));
            }

            try {
                // Fetch performance metrics
                setLoading(prev => ({ ...prev, metrics: true }));
                const metricData = await analyticsService.getPerformanceMetrics();
                setPerformanceMetrics(metricData);
            } catch (err) {
                console.error('Failed to fetch metrics:', err);
            } finally {
                setLoading(prev => ({ ...prev, metrics: false }));
            }

            try {
                // Fetch recent reservations
                setLoading(prev => ({ ...prev, reservations: true }));
                const reservations = await reservationService.getReservations({ limit: 5 });
                setRecentReservations(reservations.data);
            } catch (err) {
                console.error('Failed to fetch reservations:', err);
            } finally {
                setLoading(prev => ({ ...prev, reservations: false }));
            }
        };

        fetchDashboardData();
    }, []);

    // Convert API tasks to TaskCard format
    const convertTasksForCard = (apiTasks: DashboardTask[]): Task[] => {
        return apiTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate || new Date().toISOString().split('T')[0],
            priority: task.priority,
            status: task.status,
            leadId: task.leadId || 0,
            leadName: task.leadName
        }));
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {loading.kpis ? (
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
                                    : kpi.title.includes('Today')
                                        ? Clock
                                        : kpi.title.includes('Active')
                                            ? Car
                                            : BarChart3
                            }
                        />
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <Link
                    href="/dispatch"
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Dispatch Board</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {recentReservations.filter(r => r.reservation_status === 'pending').length} pending
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                </Link>
                <Link
                    href="/analytics"
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Analytics</p>
                            <p className="text-xs text-slate-500 mt-1">View insights</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Recent Form Submissions & Recent Reservations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Form Submissions */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900">Recent Form Submissions</h3>
                        <Link
                            href="/forms"
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading.forms ? (
                            <p className="text-sm text-slate-500">Loading submissions...</p>
                        ) : recentForms.length === 0 ? (
                            <p className="text-sm text-slate-500">No submissions yet</p>
                        ) : (
                            recentForms.map((form) => (
                                <Link key={form.id} href={`/forms/${form.id}`}>
                                    <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{form.name}</p>
                                                <p className="text-xs text-slate-600">{form.phone}</p>
                                                <p className="text-xs text-slate-500 truncate mt-1">
                                                    {form.pickup} → {form.dropoff}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-400">
                                                    {new Date(form.date).toLocaleDateString()}
                                                </span>
                                                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                                                    form.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    form.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    form.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {form.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Reservations */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900">Recent Reservations</h3>
                        <Link
                            href="/reservations"
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading.reservations ? (
                            <p className="text-sm text-slate-500">Loading reservations...</p>
                        ) : recentReservations.length === 0 ? (
                            <p className="text-sm text-slate-500">No reservations yet</p>
                        ) : (
                            recentReservations.map((res) => (
                                <Link key={res.id} href={`/reservations/${res.id}`}>
                                    <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {res.passenger_name}
                                                    </p>
                                                    <span className="ml-2 text-xs text-slate-500">
                                                        #{res.reservation_number}
                                                    </span>
                                                </div>
                                                <div className="flex items-center mt-1 text-xs text-slate-600">
                                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span className="truncate">{res.pickup_location}</span>
                                                </div>
                                                <div className="flex items-center mt-1 text-xs text-slate-600">
                                                    <Car className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span>{res.vehicle_type || `Vehicle #${res.vehicle_type_id}`}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end ml-2">
                                                <span className="text-xs font-medium text-slate-900">
                                                    ${res.price}
                                                </span>
                                                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                                                    res.reservation_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    res.reservation_status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                                                    res.reservation_status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                    res.reservation_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {res.reservation_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Metrics & Upcoming Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900">Performance Metrics</h3>
                        <Link
                            href="/analytics"
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                        >
                            View analytics
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {loading.metrics ? (
                            <p className="text-sm text-slate-500">Loading metrics...</p>
                        ) : performanceMetrics.length === 0 ? (
                            <p className="text-sm text-slate-500">No metrics available</p>
                        ) : (
                            performanceMetrics.map((metric, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-slate-900">{metric.metric}</p>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-semibold text-slate-900">{metric.value}</span>
                                                <span className="text-xs text-slate-500">/ {metric.target}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    metric.progress >= 90 ? 'bg-green-500' :
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

                {/* Upcoming Tasks */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900">Upcoming Tasks</h3>
                        <Link
                            href="/tasks"
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading.tasks ? (
                            <p className="text-sm text-slate-500">Loading tasks...</p>
                        ) : upcomingTasks.length === 0 ? (
                            <p className="text-sm text-slate-500">No upcoming tasks</p>
                        ) : (
                            convertTasksForCard(upcomingTasks).map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}