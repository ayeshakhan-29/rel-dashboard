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
    <div className="bg-card border-b border-border px-6 py-2 transition-colors duration-300">
      <div className="flex gap-1 overflow-x-auto">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === filter.key
                ? "bg-slate-800 dark:bg-emerald-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === filter.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
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
