export interface KPI {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}

export interface Lead {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    status: string;
    value: number;
    priority: 'High' | 'Medium' | 'Low';
    lastContact: string;
    source: string;
    assignedTo: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    leadId: number;
    leadName: string;
}

export interface PipelineStage {
    name: string;
    count: number;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

export interface Activity {
    id: number;
    type: 'call' | 'email' | 'meeting' | 'note';
    description: string;
    timestamp: string;
    leadId: number;
    leadName: string;
}

// Note: Dummy data arrays removed - now using real APIs
// Only keeping interfaces for backward compatibility
// Consider migrating to @/types for centralized type definitions
