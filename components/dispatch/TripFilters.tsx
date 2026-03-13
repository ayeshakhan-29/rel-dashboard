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
  setActiveFilter
}: TripFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex space-x-1">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeFilter === filter.key
                ? "bg-white text-blue-600 border-t-2 border-blue-500 -mb-px"
                : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>
    </div>
  );
}
