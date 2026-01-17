'use client';

import { useState } from 'react';
import { Settings, ToggleLeft, ToggleRight, RefreshCw, Users, Filter } from 'lucide-react';

interface PipelineControlsProps {
    isDragEnabled: boolean;
    onToggleDrag: (enabled: boolean) => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
    totalLeads?: number;
}

export default function PipelineControls({
    isDragEnabled,
    onToggleDrag,
    onRefresh,
    isRefreshing = false,
    totalLeads = 0
}: PipelineControlsProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>{totalLeads} Total Leads</span>
                </div>
                <p className="text-sm text-slate-600">
                    Manage your sales pipeline and track deals through each stage
                </p>
            </div>

            <div className="flex items-center space-x-4">
                {/* Refresh Button */}
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>

                {/* Filters Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </button>

                {/* Drag & Drop Toggle */}
                <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Drag & Drop:</span>
                    <button
                        onClick={() => onToggleDrag(!isDragEnabled)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDragEnabled
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {isDragEnabled ? (
                            <>
                                <ToggleRight className="h-4 w-4" />
                                <span>Enabled</span>
                            </>
                        ) : (
                            <>
                                <ToggleLeft className="h-4 w-4" />
                                <span>Disabled</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}