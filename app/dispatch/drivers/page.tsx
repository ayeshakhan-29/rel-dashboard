"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../../components/auth/PrivateRoute";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Users,
  MapPin,
  Phone,
  Star,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import TripAssignmentAlgorithm, { Driver, Trip } from "@/lib/tripAssignment";

// Mock driver data
const mockDrivers: Driver[] = [
  {
    id: "driver1",
    name: "Marcus Johnson",
    status: "available",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "Manhattan, NY",
    },
    rating: 4.8,
    vehicleType: "mercedes_sprinter",
    completedTrips: 156,
    currentLocation: {
      lat: 40.7589,
      lng: -73.9851,
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: "driver2",
    name: "rimpal Singh",
    status: "available",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "Queens, NY",
    },
    rating: 4.9,
    vehicleType: "first_class_suv",
    completedTrips: 203,
    currentLocation: {
      lat: 40.7282,
      lng: -73.7949,
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: "driver3",
    name: "Parveshpreet Kaur",
    status: "on_trip",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "Brooklyn, NY",
    },
    rating: 4.7,
    vehicleType: "business_sedan",
    completedTrips: 89,
    currentLocation: {
      lat: 40.6782,
      lng: -73.9442,
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: "driver4",
    name: "David Chen",
    status: "offline",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "Bronx, NY",
    },
    rating: 4.6,
    vehicleType: "electric_sedan",
    completedTrips: 67,
  },
];

// Mock trip for testing assignment
const mockTrip: Trip = {
  id: "REL-TEST001",
  pickupLocation: {
    lat: 40.6413,
    lng: -73.7781,
    address: "JFK Airport, Terminal 4",
  },
  dropoffLocation: {
    lat: 40.7589,
    lng: -73.9851,
    address: "Times Square, Manhattan",
  },
  vehicleType: "first_class_suv",
  passengerCount: 2,
  scheduledTime: "2026-03-14T15:30:00Z",
  priority: "medium",
  estimatedDuration: 45,
  price: 150,
};

function DriversContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignmentAlgorithm] = useState(
    () => new TripAssignmentAlgorithm(mockDrivers),
  );
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const [showAssignmentTest, setShowAssignmentTest] = useState(false);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      searchQuery === "" ||
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const testAssignment = () => {
    const results = assignmentAlgorithm.getDriverOptions(mockTrip, 3);
    setAssignmentResults(results);
    setShowAssignmentTest(true);
  };

  const assignDriverToTrip = (driverId: string) => {
    const assignedDriver = assignmentAlgorithm.assignDriver(mockTrip);
    if (assignedDriver) {
      assignmentAlgorithm.updateDriverStatus(driverId, "on_trip");
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId ? { ...d, status: "on_trip" as const } : d,
        ),
      );
      alert(`Driver ${assignedDriver.name} assigned to trip ${mockTrip.id}`);
    } else {
      alert("No suitable driver available for this trip");
    }
  };

  const getVehicleDisplayName = (vehicleType: string) => {
    const vehicleNames: { [key: string]: string } = {
      business_sedan: "Business Sedan",
      first_class_sedan: "First Class Sedan",
      first_class_suv: "First Class SUV",
      mercedes_sprinter: "Mercedes Sprinter",
      electric_sedan: "Electric Sedan",
    };
    return vehicleNames[vehicleType] || vehicleType;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50";
      case "on_trip":
        return "text-blue-600 bg-blue-50";
      case "offline":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "on_trip":
        return <Clock className="w-4 h-4" />;
      case "offline":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Drivers Management"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Drivers Management
                </h1>
                <div className="flex space-x-3">
                  <button
                    onClick={testAssignment}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-white"
                  >
                    Test Assignment Algorithm
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-white">
                    Add Driver
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Assignment Test Results */}
            {showAssignmentTest && (
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assignment Test Results
                  </h2>
                  <button
                    onClick={() => setShowAssignmentTest(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    Test Trip: {mockTrip.id}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Route: {mockTrip.pickupLocation.address} →{" "}
                    {mockTrip.dropoffLocation.address}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Vehicle: {getVehicleDisplayName(mockTrip.vehicleType)}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Passengers: {mockTrip.passengerCount}
                  </p>
                </div>

                <div className="space-y-3">
                  {assignmentResults.map((result, index) => (
                    <div
                      key={result.driver.id}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-blue-400">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {result.driver.name}
                            </p>
                            <p className="text-sm text-gray-700">
                              {getVehicleDisplayName(result.driver.vehicleType)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {result.score}
                          </p>
                          <p className="text-xs text-gray-400">Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 text-xs mb-3">
                        <div className="text-center">
                          <p className="text-gray-500">Proximity</p>
                          <p className="font-semibold">
                            {result.factors.proximity}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Availability</p>
                          <p className="font-semibold">
                            {result.factors.availability}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Vehicle</p>
                          <p className="font-semibold">
                            {result.factors.vehicleMatch}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Rating</p>
                          <p className="font-semibold">
                            {result.factors.rating}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Workload</p>
                          <p className="font-semibold">
                            {result.factors.workload}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                          ETA: {result.estimatedArrival} mins
                        </p>
                        <button
                          onClick={() => assignDriverToTrip(result.driver.id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors text-white"
                        >
                          Assign Driver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {driver.name}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {driver.id}</p>
                    </div>
                    <div
                      className={`flex items-center space-x-2 px-2 py-1 rounded-full ${getStatusColor(driver.status)}`}
                    >
                      {getStatusIcon(driver.status)}
                      <span className="text-xs font-medium">
                        {driver.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {getVehicleDisplayName(driver.vehicleType)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {driver.location.address}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        +1-555-0{Math.floor(Math.random() * 9000) + 1000}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-700">
                        {driver.rating} rating
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-700">
                        {driver.completedTrips} trips completed
                      </span>
                    </div>
                  </div>

                  {driver.currentLocation && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Current Location
                      </p>
                      <p className="text-sm text-gray-700">
                        Last updated:{" "}
                        {new Date(
                          driver.currentLocation.lastUpdated,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        console.log("View driver details:", driver.id)
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors text-white"
                    >
                      View Details
                    </button>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics */}
            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Fleet Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {drivers.length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {drivers.filter((d) => d.status === "available").length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">On Trip</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {drivers.filter((d) => d.status === "on_trip").length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Offline</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {drivers.filter((d) => d.status === "offline").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DriversManagement() {
  return (
    <PrivateRoute>
      <DriversContent />
    </PrivateRoute>
  );
}
