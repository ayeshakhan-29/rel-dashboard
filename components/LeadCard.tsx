'use client';

import Link from 'next/link';
import { User, ChevronRight, GripVertical } from 'lucide-react';
import { Lead } from '@/app/services/leadsService';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LeadCardProps {
    lead: Lead;
    compact?: boolean;
    isDraggable?: boolean;
}

export default function LeadCard({ lead, compact = false, isDraggable = false }: LeadCardProps) {
    const statusColor = getStatusColor(lead.stage);
    const priorityColor = getPriorityColor('Medium'); // Default priority since API doesn't provide it

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id.toString(),
        disabled: !isDraggable,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (compact) {
        return (
            <Link
                href={`/leads/${lead.id}`}
                className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors duration-150 cursor-pointer"
            >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lead.email || lead.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                        {lead.source}
                    </p>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 bg-${statusColor}-50 text-${statusColor}-700`}
                    >
                        {lead.stage}
                    </span>
                </div>
            </Link>
        );
    }

    if (isDraggable) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`bg-white rounded-md border border-slate-200 p-3 hover:shadow-sm hover:border-slate-300 transition-all duration-150 ${isDragging ? 'shadow-lg border-emerald-300' : ''
                    }`}
            >
                <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center space-x-2 flex-1">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
                        >
                            <GripVertical className="h-3 w-3 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 flex-1">{lead.name}</p>
                    </div>
                    <Link href={`/leads/${lead.id}`} className="hover:bg-slate-100 p-1 rounded">
                        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </Link>
                </div>
                <p className="text-xs text-slate-500 mb-2 ml-6">{lead.email || lead.phone}</p>
                <p className="text-sm font-medium text-slate-700 mb-2 ml-6">
                    {lead.source}
                </p>
                <div className="flex items-center justify-between ml-6">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${priorityColor}-50 text-${priorityColor}-700`}
                    >
                        Medium
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(lead.updated_at)}</span>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={`/leads/${lead.id}`}
            className="bg-white rounded-md border border-slate-200 p-3 hover:shadow-sm hover:border-slate-300 transition-all duration-150 cursor-pointer block"
        >
            <div className="flex items-start justify-between mb-1.5">
                <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500 mb-2">{lead.email || lead.phone}</p>
            <p className="text-sm font-medium text-slate-700 mb-2">
                {lead.source}
            </p>
            <div className="flex items-center justify-between">
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${priorityColor}-50 text-${priorityColor}-700`}
                >
                    Medium
                </span>
                <span className="text-xs text-slate-500">{formatDate(lead.updated_at)}</span>
            </div>
        </Link>
    );
}
