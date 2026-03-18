"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../../components/auth/PrivateRoute";
import { Search, Phone, Star, Car, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Plus } from "lucide-react";
import TripAssignmentAlgorithm, { Driver, Trip } from "@/lib/tripAssignment";

const mockDrivers: Driver[] = [
  { id: "driver1", name: "Marcus Johnson",    status: "available", location: { lat: 40.7128, lng: -74.006, address: "Manhattan, NY" }, rating: 4.8, vehicleType: "mercedes_sprinter", completedTrips: 156, currentLocation: { lat: 40.7589, lng: -73.9851, lastUpdated: new Date().toISOString() } },
  { id: "driver2", name: "Rimpal Singh",      status: "available", location: { lat: 40.7128, lng: -74.006, address: "Queens, NY"    }, rating: 4.9, vehicleType: "first_class_suv",   completedTrips: 203, currentLocation: { lat: 40.7282, lng: -73.7949, lastUpdated: new Date().toISOString() } },
  { id: "driver3", name: "Parveshpreet Kaur", status: "on_trip",   location: { lat: 40.7128, lng: -74.006, address: "Brooklyn, NY"  }, rating: 4.7, vehicleType: "business_sedan",    completedTrips: 89,  currentLocation: { lat: 40.6782, lng: -73.9442, lastUpdated: new Date().toISOString() } },
  { id: "driver4", name: "David Chen",        status: "offline",   location: { lat: 40.7128, lng: -74.006, address: "Bronx, NY"     }, rating: 4.6, vehicleType: "electric_sedan",    completedTrips: 67 },
];

const mockTrip: Trip = {
  id: "REL-TEST001",
  pickupLocation:  { lat: 40.6413, lng: -73.7781, address: "JFK Airport, Terminal 4" },
  dropoffLocation: { lat: 40.7589, lng: -73.9851, address: "Times Square, Manhattan" },
  vehicleType: "first_class_suv",
  passengerCount: 2,
  scheduledTime: "2026-03-14T15:30:00Z",
  priority: "medium",
  estimatedDuration: 45,
  price: 150,
};

const vehicleNames: Record<string, string> = {
  business_sedan:    "Business Sedan",
  first_class_sedan: "First Class Sedan",
  first_class_suv:   "First Class SUV",
  mercedes_sprinter: "Mercedes Sprinter",
  electric_sedan:    "Electric Sedan",
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  available: { label: "Available", cls: "text-emerald-700 bg-emerald-50 border border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  on_trip:   { label: "On Trip",   cls: "text-sky-700    bg-sky-50    border border-sky-200",       icon: <Clock       className="w-3.5 h-3.5" /> },
  offline:   { label: "Offline",   cls: "text-slate-600  bg-slate-100 border border-slate-200",     icon: <XCircle     className="w-3.5 h-3.5" /> },
};

function DriversContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [algorithm] = useState(() => new TripAssignmentAlgorithm(mockDrivers));
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const [showTest, setShowTest] = useState(false);

  const filtered = drivers.filter((d) => {
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.vehicleType.includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const testAssignment = () => {
    setAssignmentResults(algorithm.getDriverOptions(mockTrip, 3));
    setShowTest(true);
  };

  const assignDriver = (driverId: string) => {
    const assigned = algorithm.assignDriver(mockTrip);
    if (assigned) {
      algorithm.updateDriverStatus(driverId, "on_trip");
      setDrivers((prev) => prev.map((d) => d.id === driverId ? { ...d, status: "on_trip" as const } : d));
      alert(`${assigned.name} assigned to ${mockTrip.id}`);
    } else {
      alert("No suitable driver available");
    }
  };

  const stats = [
    { label: "Total",     value: drivers.length,                                    cls: "text-slate-800" },
    { label: "Available", value: drivers.filter((d) => d.status === "available").length, cls: "text-emerald-600" },
    { label: "On Trip",   value: drivers.filter((d) => d.status === "on_trip").length,   cls: "text-sky-600"     },
    { label: "Offline",   value: drivers.filter((d) => d.status === "offline").length,   cls: "text-slate-500"   },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Drivers" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="offline">Offline</option>
            </select>
            <button onClick={testAssignment} className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Test Algorithm
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          </div>

          {/* Assignment test results */}
          {showTest && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Assignment Test Results</h2>
                <button onClick={() => setShowTest(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
              </div>
              <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 space-y-1">
                <p><span className="font-medium text-slate-700">Trip:</span> {mockTrip.id}</p>
                <p><span className="font-medium text-slate-700">Route:</span> {mockTrip.pickupLocation.address} → {mockTrip.dropoffLocation.address}</p>
                <p><span className="font-medium text-slate-700">Vehicle:</span> {vehicleNames[mockTrip.vehicleType]}</p>
              </div>
              <div className="space-y-3">
                {assignmentResults.map((r, i) => (
                  <div key={r.driver.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{r.driver.name}</p>
                          <p className="text-xs text-slate-500">{vehicleNames[r.driver.vehicleType]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">{r.score}</p>
                        <p className="text-xs text-slate-400">score</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-xs text-center mb-3">
                      {Object.entries(r.factors).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-slate-400 capitalize">{k}</p>
                          <p className="font-semibold text-slate-700">{v as any}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">ETA: {r.estimatedArrival} mins</p>
                      <button onClick={() => assignDriver(r.driver.id)} className="px-3 py-1 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors">
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Driver cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((driver) => {
              const sc = statusConfig[driver.status] ?? statusConfig.offline;
              return (
                <div key={driver.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">{driver.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{driver.id}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2"><Car     className="w-3.5 h-3.5 text-slate-400" />{vehicleNames[driver.vehicleType]}</div>
                    <div className="flex items-center gap-2"><MapPin  className="w-3.5 h-3.5 text-slate-400" />{driver.location.address}</div>
                    <div className="flex items-center gap-2"><Star    className="w-3.5 h-3.5 text-amber-400" />{driver.rating} rating</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-slate-400" />{driver.completedTrips} trips</div>
                  </div>

                  {driver.currentLocation && (
                    <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
                      Last updated: {new Date(driver.currentLocation.lastUpdated).toLocaleTimeString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors">
                      View Details
                    </button>
                    <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fleet stats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">Fleet Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function DriversManagement() {
  return <PrivateRoute><DriversContent /></PrivateRoute>;
}
