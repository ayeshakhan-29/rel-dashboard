'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from './components/auth/PrivateRoute';
import KPICard from '@/components/KPICard';
import TaskCard from '@/components/TaskCard';
import { Lead } from './services/leadsService';
import { getBookings, Booking } from './services/formsService';
import dashboardService, { DashboardKPI, DashboardTask } from './services/dashboardService';
import analyticsService, { PerformanceMetric } from './services/analyticsService';
import { Task } from '@/types';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Fetch form submissions (bookings) from API
  useEffect(() => {
    const fetchFormLeads = async () => {
      try {
        setLoading(true);
        const bookingsData = await getBookings();

        const normalizeDate = (value: any): string => {
          if (!value) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'number') return new Date(value).toISOString();
          if (value && typeof value === 'object') {
            if (typeof (value as any).toDate === 'function') return (value as any).toDate().toISOString();
            if (typeof (value as any).seconds === 'number') return new Date((value as any).seconds * 1000).toISOString();
            if (typeof (value as any)._seconds === 'number') return new Date((value as any)._seconds * 1000).toISOString();
          }
          return '';
        };

        // Map bookings to Lead format (limit to 5 for recent)
        const mappedBookings: Lead[] = bookingsData.slice(0, 5).map((booking: Booking) => ({
          id: booking.id,
          name: booking.fullName || 'Unknown Name',
          phone: booking.phone || '',
          email: booking.email || '',
          stage: 'Incoming',
          source: 'Website',
          created_at: normalizeDate(booking.created_at ?? (booking as any).createdAt) || new Date().toISOString(),
          updated_at: normalizeDate(booking.updated_at ?? (booking as any).updatedAt ?? (booking as any).createdAt) || new Date().toISOString(),
        }));

        setLeads(mappedBookings);
      } catch (err) {
        console.error('Failed to fetch form submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormLeads();
  }, []);

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


  // Fetch upcoming tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const data = await dashboardService.getUpcomingTasks(3);
        setUpcomingTasks(data);
      } catch (err) {
        console.error('Failed to fetch upcoming tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
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

  // Get recent leads (top 5)
  const recentLeads = leads.slice(0, 5);

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
    <PrivateRoute>
      <div className="flex h-screen bg-slate-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
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
                      kpi.title === 'Total Leads'
                        ? Users
                        : kpi.title === 'Revenue'
                          ? DollarSign
                          : kpi.title === 'Conversion Rate'
                            ? TrendingUp
                            : BarChart3
                    }
                  />
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Link
                href="/pipeline"
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">View Pipeline</p>
                    <p className="text-xs text-slate-500 mt-1">Manage your deals</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </Link>
              <Link
                href="/tasks"
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">View Tasks</p>
                    <p className="text-xs text-slate-500 mt-1">{upcomingTasks.length} upcoming</p>
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

            {/* Recent Leads */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-slate-900">Recent Leads</h3>
                  <Link
                    href="/leads"
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading leads...</p>
                  ) : recentLeads.length === 0 ? (
                    <p className="text-sm text-slate-500">No leads yet</p>
                  ) : (
                    recentLeads.map((lead) => (
                      <Link key={lead.id} href={`/leads/${lead.id}`}>
                        <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                              <p className="text-xs text-slate-600">{lead.phone}</p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'No date'}
                            </span>
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
                  {metricsLoading ? (
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
                  {tasksLoading ? (
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
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
