'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import analyticsService from '@/app/services/analyticsService';

function AnalyticsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getOverview(parseInt(selectedPeriod));

      setRevenueData(data.revenueTrend);
      setConversionData(data.conversionFunnel);
      setPerformanceData(data.performanceMetrics);
      setDistributionData(data.pipelineDistribution);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics" onMenuClick={() => setSidebarOpen(true)} />

        {/* Analytics content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-slate-600">Loading analytics data...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Date Range and Actions */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <select
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-700"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="6">Last 6 months</option>
                    <option value="12">Last 12 months</option>
                    <option value="1">Last 30 days</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-150">
                    <Filter className="h-4 w-4 mr-1.5" />
                    Filter
                  </button>
                  <button className="flex items-center px-3.5 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors duration-150">
                    <Download className="h-4 w-4 mr-1.5" />
                    Export
                  </button>
                </div>
              </div>
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {performanceData.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{metric.metric}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{metric.value}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Target: {metric.target}</span>
                            <span className="font-semibold text-slate-700">{metric.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${metric.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50">
                        <TrendingUp className="h-5 w-5 text-slate-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Booking Trend */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-5">Booking & Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        stroke="#cbd5e1"
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        stroke="#cbd5e1"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        stroke="#cbd5e1"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0f172a"
                        strokeWidth={2.5}
                        name="Est. Revenue ($)"
                        dot={{ fill: '#0f172a', r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="leads"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        name="Bookings"
                        dot={{ fill: '#10b981', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Passenger Distribution */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-5">Passenger Count Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        stroke="#cbd5e1"
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        stroke="#cbd5e1"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Total Bookings">
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Location Distribution */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-5">Top Pickup Locations</h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
