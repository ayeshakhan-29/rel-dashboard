"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../../components/auth/PrivateRoute";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface Passenger {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalTrips: number;
  totalSpent: number;
  averageRating: number;
  lastTripDate: string;
  preferredVehicle: string;
  specialRequests: string;
  status: string;
  recentTrips: Array<{
    id: string;
    date: string;
    route: string;
    price: number;
    status: string;
    driver: string;
  }>;
}

// Mock passenger data
const mockPassengers: Passenger[] = [
  {
    id: "PAX001",
    name: "Parveshpreet",
    phone: "+1-555-0123",
    email: "parvesh@example.com",
    totalTrips: 15,
    totalSpent: 1875,
    averageRating: 4.8,
    lastTripDate: "2026-03-12",
    preferredVehicle: "First Class SUV",
    specialRequests: "Prefers quiet rides, air conditioning at 70°F",
    status: "vip",
    recentTrips: [
      {
        id: "REL-85589",
        date: "2026-03-12",
        route: "YYZ - JFK",
        price: 180,
        status: "dispatched",
        driver: "Marcus",
      },
      {
        id: "REL-17556",
        date: "2026-03-10",
        route: "JFK - New",
        price: 150,
        status: "cancelled",
        driver: "rimpal",
      },
      {
        id: "REL-65331",
        date: "2026-03-08",
        route: "JFK - Manhattan",
        price: 120,
        status: "completed",
        driver: "rimpal",
      },
    ],
  },
  {
    id: "PAX002",
    name: "John Smith",
    phone: "+1-555-0124",
    email: "john.smith@example.com",
    totalTrips: 8,
    totalSpent: 960,
    averageRating: 4.6,
    lastTripDate: "2026-03-10",
    preferredVehicle: "Business Sedan",
    specialRequests: "Business traveler, needs Wi-Fi",
    status: "active",
    recentTrips: [
      {
        id: "REL-40800",
        date: "2026-03-10",
        route: "JFK - Manhattan",
        price: 85,
        status: "completed",
        driver: "rimpal",
      },
      {
        id: "REL-23428",
        date: "2026-03-05",
        route: "JFK - NY",
        price: 110,
        status: "completed",
        driver: "Parveshpreet",
      },
    ],
  },
  {
    id: "PAX003",
    name: "Sarah Johnson",
    phone: "+1-555-0125",
    email: "sarah.j@example.com",
    totalTrips: 3,
    totalSpent: 360,
    averageRating: 4.9,
    lastTripDate: "2026-03-08",
    preferredVehicle: "Mercedes Sprinter",
    specialRequests: "Group travel, child seat required",
    status: "active",
    recentTrips: [
      {
        id: "REL-29027",
        date: "2026-03-08",
        route: "JFK - Manhattan",
        price: 180,
        status: "confirmed",
        driver: "Marcus",
      },
    ],
  },
];

function PassengersContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const [passengers, setPassengers] = useState<Passenger[]>(mockPassengers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const filteredPassengers = passengers.filter((passenger) => {
    const matchesSearch =
      searchQuery === "" ||
      passenger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      passenger.phone.includes(searchQuery) ||
      passenger.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || passenger.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "text-purple-600 bg-purple-50";
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      case "confirmed":
        return "text-purple-600";
      case "dispatched":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleViewPassenger = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setShowModal(true);
  };

  const PassengerModal = ({
    passenger,
    onClose,
  }: {
    passenger: Passenger;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {passenger.name}
              </h3>
              <p className="text-sm text-gray-500">
                Passenger ID: {passenger.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Passenger Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{passenger.phone}</span>
                  </div>
                  {passenger.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{passenger.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Preferences
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Preferred Vehicle</p>
                    <p className="text-gray-700">
                      {passenger.preferredVehicle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Special Requests</p>
                    <p className="text-gray-700">{passenger.specialRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Trips</span>
                    <span className="font-semibold text-gray-900">
                      {passenger.totalTrips}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Spent</span>
                    <span className="font-semibold text-gray-900">
                      ${passenger.totalSpent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Average Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {passenger.averageRating}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Trip</span>
                    <span className="font-semibold text-gray-900">
                      {passenger.lastTripDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Recent Trips
                </h4>
                <div className="space-y-3">
                  {passenger.recentTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm text-gray-500">
                            {trip.id}
                          </p>
                          <p className="text-sm text-gray-700">{trip.route}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-medium ${getTripStatusColor(trip.status)}`}
                          >
                            {trip.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="text-gray-700">{trip.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-semibold text-gray-900">
                            ${trip.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Driver</p>
                          <p className="text-gray-700">{trip.driver}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Passenger Management"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Passenger Management
                </h1>
                <div className="flex space-x-3">
                  <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search passengers..."
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
                    <option value="active">Active</option>
                    <option value="vip">VIP</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`px-3 py-1 rounded ${viewMode === "cards" ? "bg-white shadow-sm" : ""} transition-colors`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1 rounded ${viewMode === "table" ? "bg-white shadow-sm" : ""} transition-colors`}
                    >
                      Table
                    </button>
                  </div>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-white">
                  <Plus className="w-4 h-4" />
                  <span>Add Passenger</span>
                </button>
              </div>
            </div>
          </div>

          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredPassengers.map((passenger) => (
                <div
                  key={passenger.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {passenger.name}
                      </h3>
                      <p className="text-sm text-gray-500">{passenger.id}</p>
                    </div>
                    <div
                      className={`flex items-center space-x-2 px-2 py-1 rounded-full ${getStatusColor(passenger.status)}`}
                    >
                      <span className="text-xs font-medium">
                        {passenger.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{passenger.phone}</span>
                    </div>
                    {passenger.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{passenger.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {passenger.totalTrips} trips
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        ${passenger.totalSpent}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-700">
                        {passenger.averageRating} rating
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {passenger.lastTripDate}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Preferred Vehicle</span>
                      <span className="text-gray-700">
                        {passenger.preferredVehicle}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Special Requests</span>
                      <span className="text-gray-700 truncate max-w-xs">
                        {passenger.specialRequests}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        ${passenger.totalSpent}
                      </div>
                      <div className="text-xs text-gray-500">
                        {passenger.totalTrips} trips • {passenger.email}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPassenger(passenger)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                      <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Passenger
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Statistics
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Preferences
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPassengers.map((passenger) => (
                    <tr
                      key={passenger.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {passenger.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {passenger.id}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {passenger.phone}
                            </span>
                          </div>
                          {passenger.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {passenger.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {passenger.totalTrips} trips
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              ${passenger.totalSpent}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-700">
                              {passenger.averageRating} rating
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {passenger.lastTripDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">
                              Preferred Vehicle
                            </span>
                            <span className="text-gray-700">
                              {passenger.preferredVehicle}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">
                              Special Requests
                            </span>
                            <span className="text-gray-700 truncate max-w-xs">
                              {passenger.specialRequests}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(passenger.status)}`}
                        >
                          {passenger.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewPassenger(passenger)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && selectedPassenger && (
        <PassengerModal
          passenger={selectedPassenger}
          onClose={() => {
            setShowModal(false);
            setSelectedPassenger(null);
          }}
        />
      )}
    </div>
  );
}

export default function PassengerManagement() {
  return (
    <PrivateRoute>
      <PassengersContent />
    </PrivateRoute>
  );
}
