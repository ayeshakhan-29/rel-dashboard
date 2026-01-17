'use client';

import { Plus } from 'lucide-react';
import { PipelineStage } from '@/types';
import { Lead } from '@/app/services/leadsService';
import LeadCard from './LeadCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface PipelineColumnProps {
    stage: PipelineStage;
    leads: Lead[];
    onAddLead?: () => void;
    isDragEnabled?: boolean;
}

export default function PipelineColumn({ stage, leads, onAddLead, isDragEnabled = false }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.name,
    });

    const leadIds = leads.map(lead => lead.id.toString());

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-72 ${stage.bgColor} rounded-lg p-4 border ${stage.borderColor} ${isOver && isDragEnabled ? 'ring-2 ring-emerald-400 ring-opacity-50' : ''
                } transition-all duration-200`}
        >
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${stage.textColor}`}>{stage.name}</h4>
                <span
                    className={`text-xs font-bold ${stage.textColor} bg-white px-2 py-0.5 rounded-full`}
                >
                    {stage.count}
                </span>
            </div>
            <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {isDragEnabled ? (
                    <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                        {leads.map((lead) => (
                            <LeadCard key={lead.id} lead={lead} isDraggable={true} />
                        ))}
                    </SortableContext>
                ) : (
                    leads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} isDraggable={false} />
                    ))
                )}
            </div>
            {onAddLead && (
                <button
                    onClick={onAddLead}
                    className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Lead
                </button>
            )}
        </div>
    );
}
