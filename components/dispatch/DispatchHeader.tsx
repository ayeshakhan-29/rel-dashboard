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
    <div className="bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">{currentDate}</span>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {/* Stats */}
            <div className="flex items-center gap-4 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium text-sm">${revenue}</span>
                <span className="text-slate-400 text-xs">revenue</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-slate-700 font-medium text-sm">{activeTrips}</span>
                <span className="text-slate-400 text-xs">active</span>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "cards"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Cards
              </button>
            </div>

            {/* New Trip */}
            <button
              onClick={onNewTrip}
              className="bg-slate-800 hover:bg-slate-900 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-white text-sm font-medium"
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
