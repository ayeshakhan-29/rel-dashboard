'use client';

import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: LucideIcon;
}

export default function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
                    <div className="flex items-center mt-2">
                        <span
                            className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}
                        >
                            {change}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">vs last month</span>
                    </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
            </div>
        </div>
    );
}
