"use client";

import React from "react";
import { Users, MapPin, Clock, Car, User } from "lucide-react";

import { Trip } from "./useDispatchData";

interface TripCardsProps {
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

export default function TripCards({ trips, onViewTrip, onAssignDriver }: TripCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {trips.map((trip) => (
        <div key={trip.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-mono text-xs text-slate-400">{trip.id}</div>
                <div className="font-semibold text-slate-800 mt-0.5">{trip.client}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[trip.status] ?? statusStyles.unassigned}`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace("_", " ")}
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {trip.passengers} passengers
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {trip.route}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {trip.dateTime}
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {trip.vehicle}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={trip.driver ? "text-slate-700" : "text-slate-400 italic"}>
                  {trip.driver || "Unassigned"}
                </span>
                {!trip.driver && (
                  <button
                    onClick={() => onAssignDriver(trip.id)}
                    className="ml-auto text-[10px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700 transition-colors"
                  >
                    Assign Driver
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-800">${trip.price}</div>
              <div className="text-xs text-slate-400">{trip.payment.method} · {trip.payment.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewTrip(trip.id)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
              >
                View
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => onAssignDriver(trip.id)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
              >
                {trip.actions.includes("assign") ? "Assign" : "Send"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
