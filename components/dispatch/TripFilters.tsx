"use client";

import React from "react";

interface StatusFilter {
  key: string;
  label: string;
  count: number;
}

interface TripFiltersProps {
  statusFilters: StatusFilter[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function TripFilters({
  statusFilters,
  activeFilter,
  setActiveFilter,
}: TripFiltersProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2">
      <div className="flex gap-1 overflow-x-auto">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === filter.key
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {filter.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === filter.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
