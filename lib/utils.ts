import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
        'New Leads': 'slate',
        'Contacted': 'slate',
        'Qualified': 'emerald',
        'Proposal': 'purple',
        'Second Wing': 'amber',
        'Closed Won': 'emerald',
        'Closed Lost': 'rose',
    };
    return statusMap[status] || 'slate';
}

export function getPriorityColor(priority: string): string {
    const priorityMap: Record<string, string> = {
        'High': 'rose',
        'Medium': 'amber',
        'Low': 'slate',
    };
    return priorityMap[priority] || 'slate';
}

export function getTaskStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
        'Completed': 'emerald',
        'In Progress': 'slate',
        'Pending': 'slate',
    };
    return statusMap[status] || 'slate';
}
