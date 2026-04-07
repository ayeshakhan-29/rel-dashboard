'use client';

import { useEffect, useState } from 'react';
import reservationService from '@/app/services/reservationService';
import { Loader2, ArrowRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    pending:                 'bg-amber-100 text-amber-700',
    pending_driver_approval: 'bg-violet-100 text-violet-700',
    assigned:                'bg-blue-100 text-blue-700',
    confirmed:               'bg-emerald-100 text-emerald-700',
    in_progress:             'bg-orange-100 text-orange-700',
    completed:               'bg-green-100 text-green-700',
    cancelled:               'bg-red-100 text-red-700',
    rejected:                'bg-red-100 text-red-700',
    driver_denied:           'bg-red-100 text-red-700',
};

function StatusChip({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

export default function TripStatusLog({ reservationId }: { reservationId: number }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reservationService.getStatusLogs(reservationId)
            .then(setLogs)
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, [reservationId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading activity...
            </div>
        );
    }

    if (logs.length === 0) {
        return <p className="text-sm text-slate-400 py-2">No status changes recorded yet.</p>;
    }

    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-sm">
                            <StatusChip status={log.from_status} />
                            <ArrowRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <StatusChip status={log.to_status} />
                            <span className="text-slate-500 text-xs">by {log.changed_by_name} ({log.changed_by_role})</span>
                        </div>
                        {log.note && (
                            <p className="text-xs text-slate-500 mt-0.5 italic">"{log.note}"</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
