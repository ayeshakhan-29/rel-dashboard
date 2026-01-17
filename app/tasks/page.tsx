'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Search, Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '../components/auth/PrivateRoute';
import TaskCard from '@/components/TaskCard';

import { getTasks, Task } from '../services/tasksService';

export default function TasksPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getTasks();
            setTasks(response.data);
        } catch (err: any) {
            console.error('Error fetching tasks:', err);
            setError(err.response?.data?.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        if (filterStatus !== 'all' && task.status !== filterStatus) return false;
        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
        return true;
    });

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Task Management" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        {/* Filters and Actions */}
                        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex text-black items-center space-x-3">
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white w-64"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Priority</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <button
                                onClick={() => router.push('/create-task')}
                                className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                            </button>
                        </div>

                        {/* Task List */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Tasks ({filteredTasks.length})
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-500">{error}</p>
                                        <button
                                            onClick={fetchTasks}
                                            className="mt-4 px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={{
                                                id: task.id,
                                                title: task.title,
                                                description: task.description || '',
                                                dueDate: task.due_date || '',
                                                priority: task.priority,
                                                status: task.status,
                                                leadId: task.lead_id || 0,
                                                leadName: ''
                                            }}
                                            onStatusUpdate={(taskId, newStatus) => {
                                                // Update the task in local state
                                                setTasks(prevTasks =>
                                                    prevTasks.map(t =>
                                                        t.id === taskId
                                                            ? { ...t, status: newStatus }
                                                            : t
                                                    )
                                                );
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500">No tasks found</p>
                                        <button
                                            onClick={() => router.push('/create-task')}
                                            className="mt-4 px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700"
                                        >
                                            Create your first task
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}
