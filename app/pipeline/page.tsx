'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PipelineColumn from '@/components/PipelineColumn';
import pipelineService from '@/app/services/pipelineService';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import LeadCard from '@/components/LeadCard';
import PipelineControls from '@/components/PipelineControls';
import StageChangeNotification from '@/components/StageChangeNotification';

export default function PipelinePage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [leadsByStage, setLeadsByStage] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDragEnabled, setIsDragEnabled] = useState(false);
    const [activeLead, setActiveLead] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState<{
        leadName: string;
        fromStage: string;
        toStage: string;
    } | null>(null);

    useEffect(() => {
        fetchPipelineData();
    }, []);

    const fetchPipelineData = async () => {
        try {
            setLoading(true);
            const data = await pipelineService.getPipelineData();

            // Define stage configuration
            const stageConfig = [
                { name: 'New', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
                { name: 'Incoming', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
                { name: 'Contacted', bgColor: 'bg-slate-100', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
                { name: 'Qualified', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
                { name: 'Proposal', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
                { name: 'Second Wing', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
                { name: 'Won', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
                { name: 'Lost', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
            ];

            // Map API data to match the expected format
            const mappedData = stageConfig.map((stageInfo) => {
                const apiStage = data.find(d => d.stage === stageInfo.name);
                return {
                    stage: {
                        name: stageInfo.name,
                        count: apiStage?.count || 0,
                        bgColor: stageInfo.bgColor,
                        textColor: stageInfo.textColor,
                        borderColor: stageInfo.borderColor
                    },
                    leads: apiStage?.leads.map((lead: any) => ({
                        id: lead.id,
                        name: lead.name || 'Unknown',
                        company: lead.email || '',
                        value: '$0',
                        status: lead.stage,
                        priority: 'Medium' as 'High' | 'Medium' | 'Low',
                        lastContact: lead.last_message_at || lead.updated_at,
                        phone: lead.phone,
                        email: lead.email,
                        source: lead.source,
                        assignedTo: 'System'
                    })) || []
                };
            });

            setLeadsByStage(mappedData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching pipeline data:', err);
            setError(err.response?.data?.message || 'Failed to load pipeline data');
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (leadId: number, newStage: string, leadName?: string, fromStage?: string) => {
        try {
            setUpdating(true);
            await pipelineService.updateLeadStage(leadId, newStage);

            // Show success notification
            if (leadName && fromStage) {
                setNotification({
                    leadName,
                    fromStage,
                    toStage: newStage
                });
            }

            // Refresh data after update
            await fetchPipelineData();
        } catch (err: any) {
            console.error('Error updating lead stage:', err);
            alert('Failed to update lead stage');
        } finally {
            setUpdating(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const leadId = parseInt(active.id.toString());

        // Find the lead being dragged
        for (const stageData of leadsByStage) {
            const lead = stageData.leads.find((l: any) => l.id === leadId);
            if (lead) {
                setActiveLead(lead);
                break;
            }
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        // Find which stage the active lead is in
        const activeStageIndex = leadsByStage.findIndex(stage =>
            stage.leads.some((lead: any) => lead.id.toString() === activeId)
        );

        // Find which stage we're over
        const overStageIndex = leadsByStage.findIndex(stage => stage.stage.name === overId);

        if (activeStageIndex === -1 || overStageIndex === -1) return;
        if (activeStageIndex === overStageIndex) return;

        // Move lead between stages
        setLeadsByStage(prev => {
            const newStages = [...prev];
            const activeStage = newStages[activeStageIndex];
            const overStage = newStages[overStageIndex];

            const leadIndex = activeStage.leads.findIndex((lead: any) => lead.id.toString() === activeId);
            const [movedLead] = activeStage.leads.splice(leadIndex, 1);

            // Update lead stage
            movedLead.stage = overStage.stage.name;

            // Add to new stage
            overStage.leads.push(movedLead);

            // Update counts
            activeStage.stage.count = activeStage.leads.length;
            overStage.stage.count = overStage.leads.length;

            return newStages;
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveLead(null);

        if (!over) return;

        const leadId = parseInt(active.id.toString());
        const newStage = over.id.toString();

        // Check if it's a stage (not another lead)
        const stageNames = leadsByStage.map(s => s.stage.name);
        if (stageNames.includes(newStage)) {
            // Find lead details for notification
            let leadName = '';
            let fromStage = '';
            for (const stageData of leadsByStage) {
                const lead = stageData.leads.find((l: any) => l.id === leadId);
                if (lead) {
                    leadName = lead.name;
                    fromStage = lead.stage;
                    break;
                }
            }

            // Update in backend
            await handleStageChange(leadId, newStage, leadName, fromStage);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Pipeline Board" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <PipelineControls
                        isDragEnabled={isDragEnabled}
                        onToggleDrag={setIsDragEnabled}
                        onRefresh={fetchPipelineData}
                        isRefreshing={loading}
                        totalLeads={leadsByStage.reduce((total, stage) => total + stage.stage.count, 0)}
                    />

                    {updating && (
                        <div className="mb-4 flex items-center justify-center space-x-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                            <span>Updating lead stage...</span>
                        </div>
                    )}

                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-slate-600">Loading pipeline data...</div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <DndContext
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="overflow-x-auto -mx-6 px-6 pb-4">
                                <div className="flex space-x-4 min-w-max">
                                    {leadsByStage.map(({ stage, leads: stageLeads }, index) => (
                                        <PipelineColumn
                                            key={index}
                                            stage={stage}
                                            leads={stageLeads}
                                            onAddLead={() => console.log('Add lead to', stage.name)}
                                            isDragEnabled={isDragEnabled}
                                        />
                                    ))}
                                </div>
                            </div>
                            <DragOverlay>
                                {activeLead ? (
                                    <div className="rotate-3 opacity-90">
                                        <LeadCard lead={activeLead} isDraggable={false} />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}

                    {/* Success Notification */}
                    {notification && (
                        <StageChangeNotification
                            leadName={notification.leadName}
                            fromStage={notification.fromStage}
                            toStage={notification.toStage}
                            onClose={() => setNotification(null)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
