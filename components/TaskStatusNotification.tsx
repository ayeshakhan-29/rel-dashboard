'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, ArrowRight } from 'lucide-react';

interface TaskStatusNotificationProps {
    taskTitle: string;
    fromStatus: string;
    toStatus: string;
    onClose: () => void;
}

export default function TaskStatusNotification({
    taskTitle,
    fromStatus,
    toStatus,
    onClose
}: TaskStatusNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-100 text-emerald-700';
            case 'In Progress':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>
            <div className="bg-white border border-emerald-200 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                            Task status updated
                        </p>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-slate-600">
                            <span className="font-medium truncate max-w-[120px]" title={taskTitle}>
                                {taskTitle}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-0.5 rounded ${getStatusColor(fromStatus)}`}>
                                {fromStatus}
                            </span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                            <span className={`px-2 py-0.5 rounded ${getStatusColor(toStatus)}`}>
                                {toStatus}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}