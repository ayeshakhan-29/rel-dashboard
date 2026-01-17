'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { updateTaskStatus } from '@/app/services/tasksService';

interface TaskStatusBadgeProps {
    taskId: number;
    currentStatus: 'Pending' | 'In Progress' | 'Completed';
    onStatusUpdate?: (taskId: number, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
    size?: 'sm' | 'md';
    taskTitle?: string;
    showNotification?: boolean;
}

export default function TaskStatusBadge({
    taskId,
    currentStatus,
    onStatusUpdate,
    size = 'sm'
}: TaskStatusBadgeProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = async (newStatus: 'Pending' | 'In Progress' | 'Completed') => {
        if (newStatus === currentStatus) return;

        try {
            setIsUpdating(true);
            console.log('Updating task status via badge:', { taskId, newStatus });

            const result = await updateTaskStatus(taskId, newStatus);
            console.log('Badge status update result:', result);

            // Call parent callback if provided
            if (onStatusUpdate) {
                onStatusUpdate(taskId, newStatus);
            }

            setShowDropdown(false);
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
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-700',
                    icon: CheckCircle,
                    hoverBg: 'hover:bg-emerald-200'
                };
            case 'In Progress':
                return {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    icon: Clock,
                    hoverBg: 'hover:bg-slate-200'
                };
            default:
                return {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    icon: AlertCircle,
                    hoverBg: 'hover:bg-slate-200'
                };
        }
    };

    const statusConfig = getStatusConfig(currentStatus);
    const StatusIcon = statusConfig.icon;

    const sizeClasses = size === 'sm'
        ? 'px-2 py-1 text-xs'
        : 'px-3 py-1.5 text-sm';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isUpdating}
                className={`inline-flex items-center space-x-1 ${sizeClasses} font-medium rounded-full transition-colors ${statusConfig.bg} ${statusConfig.text} ${statusConfig.hoverBg} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
            >
                {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <>
                        <StatusIcon className="h-3 w-3" />
                        <span>{currentStatus}</span>
                        <ChevronDown className="h-3 w-3" />
                    </>
                )}
            </button>

            {showDropdown && !isUpdating && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    {['Pending', 'In Progress', 'Completed'].map((status) => {
                        const config = getStatusConfig(status);
                        const Icon = config.icon;

                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status as 'Pending' | 'In Progress' | 'Completed')}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${status === currentStatus ? 'bg-slate-50 font-medium' : ''
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Icon className={`h-3 w-3 ${config.text}`} />
                                    <span>{status}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}