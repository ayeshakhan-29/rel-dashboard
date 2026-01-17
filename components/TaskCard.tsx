'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Phone, Mail, CheckCircle, Clock, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Task } from '@/types';
import { formatDate, getPriorityColor, getTaskStatusColor } from '@/lib/utils';
import { updateTaskStatus } from '@/app/services/tasksService';

interface TaskCardProps {
    task: Task;
    onStatusUpdate?: (taskId: number, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
}

export default function TaskCard({ task, onStatusUpdate }: TaskCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const priorityColor = getPriorityColor(task.priority);
    const statusColor = getTaskStatusColor(task.status);

    const StatusIcon = task.status === 'Completed'
        ? CheckCircle
        : task.status === 'In Progress'
            ? Clock
            : AlertCircle;

    const handleStatusChange = async (newStatus: 'Pending' | 'In Progress' | 'Completed') => {
        if (newStatus === task.status) return;

        try {
            setIsUpdating(true);
            console.log('Updating task status:', { taskId: task.id, newStatus });

            const result = await updateTaskStatus(task.id, newStatus);
            console.log('Status update result:', result);

            // Call parent callback if provided
            if (onStatusUpdate) {
                onStatusUpdate(task.id, newStatus);
            }

            setShowStatusDropdown(false);
        } catch (error: any) {
            console.error('Failed to update task status:', error);

            // Show detailed error message
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update task status';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Completed':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle };
            case 'In Progress':
                return { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock };
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-500', icon: AlertCircle };
        }
    };

    const statusConfig = getStatusConfig(task.status);

    return (
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150">
            <div className="flex items-center space-x-3.5">
                <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <div className="flex items-center space-x-3 mt-1.5">
                        <span className="text-xs text-slate-500 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(task.dueDate)}
                        </span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.priority === 'High'
                                ? 'bg-rose-50 text-rose-700'
                                : task.priority === 'Medium'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {task.priority}
                        </span>
                        <span className="text-xs text-slate-500">{task.leadName}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {/* Status Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        disabled={isUpdating}
                        className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${task.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : task.status === 'In Progress'
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <>
                                <span>{task.status}</span>
                                <ChevronDown className="h-3 w-3" />
                            </>
                        )}
                    </button>

                    {showStatusDropdown && !isUpdating && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            {['Pending', 'In Progress', 'Completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status as 'Pending' | 'In Progress' | 'Completed')}
                                    className={`w-full text-black text-left px-3 py-2 text-xs hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${status === task.status ? 'bg-slate-50 font-medium' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        {status === 'Completed' && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                                        {status === 'In Progress' && <Clock className="h-3 w-3 text-slate-600" />}
                                        {status === 'Pending' && <AlertCircle className="h-3 w-3 text-slate-500" />}
                                        <span>{status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Mail className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
