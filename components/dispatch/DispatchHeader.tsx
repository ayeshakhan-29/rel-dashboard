"use client";

import React from "react";
import { Search, Plus, DollarSign } from "lucide-react";

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
  onNewTrip
}: DispatchHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dispatch Board</h1>
            <span className="text-gray-500">{currentDate}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-semibold">${revenue} revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-500">{activeTrips} active</span>
              </div>
            </div>
            
            <button
              onClick={onNewTrip}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-white"
            >
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </button>
            
            <button className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors text-gray-700">
              AD
            </button>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded ${viewMode === "table" ? "bg-white shadow-sm" : ""} transition-colors`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded ${viewMode === "cards" ? "bg-white shadow-sm" : ""} transition-colors`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips, clients, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
