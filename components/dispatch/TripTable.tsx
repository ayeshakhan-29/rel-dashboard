"use client";

import React from "react";
import { MapPin, Clock } from "lucide-react";

import { Trip } from "./useDispatchData";

interface TripTableProps {
  trips: Trip[];
  onViewTrip: (tripId: string) => void;
  onAssignDriver: (tripId: string) => void;
}

const statusStyles: Record<string, string> = {
  completed:   "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30",
  dispatched:  "text-sky-700    dark:text-sky-400    bg-sky-50    dark:bg-sky-900/20    border border-sky-200    dark:border-sky-900/30",
  confirmed:   "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900/30",
  scheduled:   "text-amber-700  dark:text-amber-400  bg-amber-50  dark:bg-amber-900/20  border border-amber-200  dark:border-amber-900/30",
  in_progress: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30",
  cancelled:   "text-rose-700   dark:text-rose-400   bg-rose-50   dark:bg-rose-900/20   border border-rose-200   dark:border-rose-900/30",
  unassigned:  "text-slate-600  dark:text-slate-400  bg-slate-100 dark:bg-slate-800      border border-slate-200  dark:border-slate-700",
};

const paymentStyles: Record<string, string> = {
  PAID:     "text-emerald-600 dark:text-emerald-400",
  PENDING:  "text-amber-600 dark:text-amber-400",
  FAILED:   "text-rose-600 dark:text-rose-400",
  REFUNDED: "text-slate-500 dark:text-slate-400",
};

export default function TripTable({ trips, onViewTrip, onAssignDriver }: TripTableProps) {
  return (
    <div className="overflow-x-auto bg-card transition-colors duration-300">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
            {["ID", "Client", "Route", "Date / Time", "Vehicle", "Driver", "Payment", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trips.map((trip) => (
            <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">{trip.id}</td>
              <td className="py-3 px-4">
                <div className="font-medium text-foreground">{trip.client}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{trip.passengers} pax</div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 text-foreground/80">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {trip.route}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 text-foreground/80">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {trip.dateTime}
                </div>
              </td>
              <td className="py-3 px-4 text-foreground/80">{trip.vehicle}</td>
              <td className="py-3 px-4">
                <div className={`font-medium ${trip.driver ? "text-foreground" : "text-slate-400 italic"}`}>
                  {trip.driver || "Unassigned"}
                </div>
                {!trip.driver && (
                  <button
                    onClick={() => onAssignDriver(trip.id)}
                    className="mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    Assign Driver
                  </button>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="text-foreground/80">{trip.payment.method}</div>
                <div className={`text-xs font-medium ${paymentStyles[trip.payment.status] ?? "text-slate-500"}`}>
                  {trip.payment.status}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[trip.status] ?? statusStyles.unassigned}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace("_", " ")}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewTrip(trip.id)}
                    className="text-slate-600 dark:text-slate-400 hover:text-foreground font-medium text-xs underline-offset-2 hover:underline transition-colors"
                  >
                    View
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <button className="text-slate-600 dark:text-slate-400 hover:text-foreground font-medium text-xs underline-offset-2 hover:underline transition-colors">
                    {trip.actions.includes("assign") ? "Assign" : "Send"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
