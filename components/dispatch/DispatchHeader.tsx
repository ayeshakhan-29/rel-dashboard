"use client";

import React from "react";
import { Search, Plus, TrendingUp, Activity } from "lucide-react";

interface DispatchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
  revenue: number;
  activeTrips: number;
  onNewTrip: () => void;
}

export default function DispatchHeader({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  revenue,
  activeTrips,
  onNewTrip,
}: DispatchHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-card border-b border-border transition-colors duration-300">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">{currentDate}</span>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {/* Stats */}
            <div className="flex items-center gap-4 px-3 py-1.5 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-foreground font-medium text-sm">${revenue}</span>
                <span className="text-slate-400 text-xs">revenue</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-foreground font-medium text-sm">{activeTrips}</span>
                <span className="text-slate-400 text-xs">active</span>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex bg-background border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-slate-400 hover:text-foreground"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "cards"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-slate-400 hover:text-foreground"
                }`}
              >
                Cards
              </button>
            </div>

            {/* New Trip */}
            <button
              onClick={onNewTrip}
              className="bg-slate-800 dark:bg-emerald-600 hover:bg-slate-900 dark:hover:bg-emerald-700 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips, clients, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-foreground placeholder-slate-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
