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
  completed:   "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30",
  dispatched:  "text-sky-700    dark:text-sky-400    bg-sky-50    dark:bg-sky-900/20    border border-sky-200    dark:border-sky-900/30",
  confirmed:   "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900/30",
  scheduled:   "text-amber-700  dark:text-amber-400  bg-amber-50  dark:bg-amber-900/20  border border-amber-200  dark:border-amber-900/30",
  in_progress: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30",
  cancelled:   "text-rose-700   dark:text-rose-400   bg-rose-50   dark:bg-rose-900/20   border border-rose-200   dark:border-rose-900/30",
  unassigned:  "text-slate-600  dark:text-slate-400  bg-slate-100 dark:bg-slate-800      border border-slate-200  dark:border-slate-700",
};

export default function TripCards({ trips, onViewTrip, onAssignDriver }: TripCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 transition-colors duration-300 bg-background">
      {trips.map((trip) => (
        <div key={trip.id} className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{trip.id}</div>
                <div className="font-semibold text-foreground mt-0.5">{trip.client}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[trip.status] ?? statusStyles.unassigned}`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace("_", " ")}
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
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
                <span className={trip.driver ? "text-foreground" : "text-slate-400 italic"}>
                  {trip.driver || "Unassigned"}
                </span>
                {!trip.driver && (
                  <button
                    onClick={() => onAssignDriver(trip.id)}
                    className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    Assign Driver
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-border flex justify-between items-center transition-colors">
            <div>
              <div className="font-semibold text-foreground">${trip.price}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{trip.payment.method} · {trip.payment.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewTrip(trip.id)}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-foreground underline-offset-2 hover:underline transition-colors"
              >
                View
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={() => onAssignDriver(trip.id)}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-foreground underline-offset-2 hover:underline transition-colors"
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
