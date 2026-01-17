'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from './components/auth/PrivateRoute';
import KPICard from '@/components/KPICard';
import TaskCard from '@/components/TaskCard';
import { getLeads, Lead } from './services/leadsService';
import dashboardService, { DashboardKPI, PipelineStageCount, DashboardTask } from './services/dashboardService';
import analyticsService, { PerformanceMetric } from './services/analyticsService';
import { Task } from '@/types';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStageCount[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await getLeads({ limit: 5 });
        setLeads(response.data.leads);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
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

  // Fetch pipeline overview from API
  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setPipelineLoading(true);
        const data = await dashboardService.getPipelineOverview();
        setPipelineStages(data);
      } catch (err) {
        console.error('Failed to fetch pipeline overview:', err);
      } finally {
        setPipelineLoading(false);
      }
    };

    fetchPipeline();
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <Link
                href="/add-lead"
                className="bg-slate-900 rounded-lg border border-slate-900 p-4 hover:bg-slate-800 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Add New Lead</p>
                    <p className="text-xs text-slate-400 mt-1">Create lead</p>
                  </div>
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
              </Link>
            </div>

            {/* Pipeline Overview & Recent Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Mini Pipeline Overview */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-slate-900">Pipeline Overview</h3>
                  <Link
                    href="/pipeline"
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center"
                  >
                    View Full Pipeline
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
                {pipelineLoading ? (
                  <div className="text-center py-8 text-slate-600">
                    Loading pipeline data...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {pipelineStages.map((stage, index) => (
                      <div
                        key={index}
                        className={`${stage.bgColor} rounded-lg p-4 border ${stage.borderColor} text-center`}
                      >
                        <p className={`text-2xl font-bold ${stage.textColor} mb-1`}>
                          {stage.count}
                        </p>
                        <p className={`text-xs font-medium ${stage.textColor}`}>
                          {stage.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Leads */}
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
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${lead.stage === 'Won' ? 'bg-green-100 text-green-700' :
                                lead.stage === 'Lost' ? 'bg-red-100 text-red-700' :
                                  lead.stage === 'Incoming' ? 'bg-blue-100 text-blue-700' :
                                    lead.stage === 'Contacted' ? 'bg-indigo-100 text-indigo-700' :
                                      'bg-slate-100 text-slate-700'
                              }`}>
                              {lead.stage}
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
