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
  } = useDispatchData();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dispatch Board"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
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

          {viewMode === "table" ? (
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
