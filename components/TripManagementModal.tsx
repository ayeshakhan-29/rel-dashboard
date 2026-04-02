"use client";

import React, { useState } from "react";
import { X, MapPin, Clock, Users, Car, User, Phone, Mail, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface Trip {
  id: string;
  client: string;
  passengers: number;
  route: string;
  dateTime: string;
  vehicle: string;
  driver?: string;
  driverStatus?: string;
  payment: {
    method: string;
    status: string;
  };
  price: number;
  status: string;
  clientPhone?: string;
  clientEmail?: string;
  specialRequests?: string;
}

interface TripManagementModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (tripId: string, newStatus: string) => void;
  onAssignDriver: (tripId: string, driverId: string) => void;
}

const availableDrivers = [
  { id: "driver1", name: "Marcus", status: "Available", rating: 4.8, phone: "+1-555-0101" },
  { id: "driver2", name: "rimpal", status: "Available", rating: 4.9, phone: "+1-555-0102" },
  { id: "driver3", name: "Parveshpreet", status: "Available", rating: 4.7, phone: "+1-555-0103" }
];

const statusOptions = [
  { value: "scheduled", label: "Scheduled", color: "text-yellow-600" },
  { value: "confirmed", label: "Confirmed", color: "text-purple-600" },
  { value: "dispatched", label: "Dispatched", color: "text-blue-600" },
  { value: "in_progress", label: "On Trip", color: "text-orange-600" },
  { value: "completed", label: "Completed", color: "text-green-600" },
  { value: "cancelled", label: "Cancelled", color: "text-red-600" }
];

export default function TripManagementModal({
  trip,
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignDriver
}: TripManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "tracking" | "actions">("details");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [newStatus, setNewStatus] = useState(trip.status);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleStatusUpdate = () => {
    if (newStatus !== trip.status) {
      onUpdateStatus(trip.id, newStatus);
    }
  };

  const handleDriverAssignment = () => {
    if (selectedDriver) {
      onAssignDriver(trip.id, selectedDriver);
    }
  };

  const sendNotification = () => {
    // Logic to send notification to client/driver
    console.log("Sending notification for trip:", trip.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Trip Management</h2>
            <p className="text-gray-400 text-sm">Trip ID: {trip.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {["details", "tracking", "actions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-gray-700 text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Client Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-medium">{trip.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Passengers</p>
                    <p className="text-white font-medium">{trip.passengers}</p>
                  </div>
                  {trip.clientPhone && (
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{trip.clientPhone}</span>
                      </p>
                    </div>
                  )}
                  {trip.clientEmail && (
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white font-medium flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{trip.clientEmail}</span>
                      </p>
                    </div>
                  )}
                </div>
                {trip.specialRequests && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400">Special Requests</p>
                    <p className="text-white mt-1">{trip.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Trip Details */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span>Trip Details</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Route</p>
                    <p className="text-white font-medium">{trip.route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date & Time</p>
                    <p className="text-white font-medium flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{trip.dateTime}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Vehicle</p>
                    <p className="text-white font-medium flex items-center space-x-2">
                      <Car className="w-4 h-4" />
                      <span>{trip.vehicle}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              {trip.driver && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Driver Information</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Driver Name</p>
                      <p className="text-white font-medium">{trip.driver}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className="text-green-400 font-medium">{trip.driverStatus}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span>Payment Information</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Method</p>
                    <p className="text-white font-medium">{trip.payment.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`font-medium ${
                      trip.payment.status === 'PAID' ? 'text-green-400' : 
                      trip.payment.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {trip.payment.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-white font-medium">${trip.price}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">Real-time Tracking</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">Driver en route to pickup location</span>
                  </div>
                  <div className="bg-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Estimated Arrival</p>
                    <p className="text-xl font-bold text-white">15 minutes</p>
                  </div>
                  <div className="bg-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Current Location</p>
                    <p className="text-white">Approaching JFK Airport, Terminal 4</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">Trip Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <p className="text-white font-medium">Trip Confirmed</p>
                      <p className="text-sm text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <p className="text-white font-medium">Driver Assigned</p>
                      <p className="text-sm text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 border-2 border-blue-400 rounded-full mt-1 animate-pulse"></div>
                    <div>
                      <p className="text-white font-medium">On Trip</p>
                      <p className="text-sm text-gray-400">Currently active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "actions" && (
            <div className="space-y-6">
              {/* Status Update */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Update Status</h3>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>

              {/* Driver Assignment */}
              {!trip.driver && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Assign Driver</h3>
                  <div className="space-y-3">
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    >
                      <option value="">Select a driver</option>
                      {availableDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.status} (⭐ {driver.rating})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleDriverAssignment}
                      disabled={!selectedDriver}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                    >
                      Assign Driver
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Send Notifications</h3>
                <div className="space-y-3">
                  <button
                    onClick={sendNotification}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Notify Client</span>
                  </button>
                  {trip.driver && (
                    <button
                      onClick={sendNotification}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Notify Driver</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Add Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this trip..."
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
                />
                <button className="mt-3 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors">
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
