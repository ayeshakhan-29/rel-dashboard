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
  completed:   "text-emerald-700 bg-emerald-50 border border-emerald-200",
  dispatched:  "text-sky-700    bg-sky-50    border border-sky-200",
  confirmed:   "text-violet-700 bg-violet-50 border border-violet-200",
  scheduled:   "text-amber-700  bg-amber-50  border border-amber-200",
  in_progress: "text-orange-700 bg-orange-50 border border-orange-200",
  cancelled:   "text-rose-700   bg-rose-50   border border-rose-200",
  unassigned:  "text-slate-600  bg-slate-100 border border-slate-200",
};

const paymentStyles: Record<string, string> = {
  PAID:     "text-emerald-600",
  PENDING:  "text-amber-600",
  FAILED:   "text-rose-600",
  REFUNDED: "text-slate-500",
};

export default function TripTable({ trips, onViewTrip, onAssignDriver }: TripTableProps) {
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {["ID", "Client", "Route", "Date / Time", "Vehicle", "Driver", "Payment", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {trips.map((trip) => (
            <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 font-mono text-xs text-slate-500">{trip.id}</td>
              <td className="py-3 px-4">
                <div className="font-medium text-slate-800">{trip.client}</div>
                <div className="text-xs text-slate-400">{trip.passengers} pax</div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {trip.route}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {trip.dateTime}
                </div>
              </td>
              <td className="py-3 px-4 text-slate-700">{trip.vehicle}</td>
              <td className="py-3 px-4">
                <div className={`font-medium ${trip.driver ? "text-slate-800" : "text-slate-400 italic"}`}>
                  {trip.driver || "Unassigned"}
                </div>
                {!trip.driver && (
                  <button
                    onClick={() => onAssignDriver(trip.id)}
                    className="mt-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700 transition-colors"
                  >
                    Assign Driver
                  </button>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="text-slate-700">{trip.payment.method}</div>
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
                    className="text-slate-600 hover:text-slate-900 font-medium text-xs underline-offset-2 hover:underline"
                  >
                    View
                  </button>
                  <span className="text-slate-300">·</span>
                  <button className="text-slate-600 hover:text-slate-900 font-medium text-xs underline-offset-2 hover:underline">
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
