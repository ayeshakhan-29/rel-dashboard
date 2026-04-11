"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminRoute from "../components/auth/AdminRoute";
import { useAuth } from "../context/AuthContext";
import DispatchHeader from "@/components/dispatch/DispatchHeader";
import TripFilters from "@/components/dispatch/TripFilters";
import TripTable from "@/components/dispatch/TripTable";
import TripCards from "@/components/dispatch/TripCards";
import { useDispatchData } from "@/components/dispatch/useDispatchData";
import { Loader2 } from "lucide-react";

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
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Dispatch Board"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background transition-colors duration-300">
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
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                <span className="ml-3 text-slate-500 dark:text-slate-400 font-medium">Loading dispatch board...</span>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-card p-4 rounded-full mb-4 text-slate-400 border border-border">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">No trips found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">There are no reservations matching your current search and filters.</p>
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
    <AdminRoute>
      <DispatchContent />
    </AdminRoute>
  );
}
