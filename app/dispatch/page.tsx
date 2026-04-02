"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../components/auth/PrivateRoute";
import { useAuth } from "../context/AuthContext";
import DispatchHeader from "@/components/dispatch/DispatchHeader";
import TripFilters from "@/components/dispatch/TripFilters";
import TripTable from "@/components/dispatch/TripTable";
import TripCards from "@/components/dispatch/TripCards";
import { useDispatchData } from "@/components/dispatch/useDispatchData";

function DispatchContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const {
    trips,
    statusFilters,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    revenue,
    activeTrips,
    handleViewTrip,
    handleAssignDriver,
    handleNewTrip,
    loading
  } = useDispatchData();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Dispatch Board"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
          <DispatchHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            revenue={revenue}
            activeTrips={activeTrips}
            onNewTrip={handleNewTrip}
          />

          <TripFilters
            statusFilters={statusFilters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                <span className="ml-3 text-slate-600 font-medium">Loading dispatch board...</span>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">No trips found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-1">There are no reservations matching your current search and filters.</p>
              </div>
            ) : viewMode === "table" ? (
              <TripTable
                trips={trips}
                onViewTrip={handleViewTrip}
                onAssignDriver={handleAssignDriver}
              />
            ) : (
              <TripCards
                trips={trips}
                onViewTrip={handleViewTrip}
                onAssignDriver={handleAssignDriver}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DispatchBoard() {
  return (
    <PrivateRoute>
      <DispatchContent />
    </PrivateRoute>
  );
}
