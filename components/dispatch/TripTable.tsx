"use client";

import React from "react";
import { MapPin, Clock, Car, User } from "lucide-react";

interface Trip {
  id: string;
  client: string;
  passengers: number;
  route: string;
  dateTime: string;
  vehicle: string;
  driver: string;
  driverStatus: string;
  payment: {
    method: string;
    status: string;
  };
  price: number;
  status: string;
  actions: string[];
}

interface TripTableProps {
  trips: Trip[];
  onViewTrip: (tripId: string) => void;
  onAssignDriver: (tripId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "text-green-600 bg-green-50";
    case "dispatched": return "text-blue-600 bg-blue-50";
    case "confirmed": return "text-purple-600 bg-purple-50";
    case "scheduled": return "text-yellow-600 bg-yellow-50";
    case "in_progress": return "text-orange-600 bg-orange-50";
    case "cancelled": return "text-red-600 bg-red-50";
    case "unassigned": return "text-gray-600 bg-gray-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "PAID": return "text-green-600";
    case "PENDING": return "text-yellow-600";
    case "FAILED": return "text-red-600";
    default: return "text-gray-600";
  }
};

export default function TripTable({ trips, onViewTrip, onAssignDriver }: TripTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date / Time</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Driver</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 font-mono text-sm text-gray-600">{trip.id}</td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-gray-900">{trip.client}</div>
                  <div className="text-sm text-gray-500">({trip.passengers} pax)</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{trip.route}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{trip.dateTime}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-700">{trip.vehicle}</td>
              <td className="py-3 px-4">
                {trip.driver ? (
                  <div>
                    <div className="font-medium text-gray-900">{trip.driver}</div>
                    <div className="text-sm text-green-600">{trip.driverStatus}</div>
                  </div>
                ) : (
                  <button 
                    onClick={() => onAssignDriver(trip.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors text-white"
                  >
                    Assign
                  </button>
                )}
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="text-sm text-gray-700">{trip.payment.method}</div>
                  <div className={`text-sm font-medium ${getPaymentStatusColor(trip.payment.status)}`}>
                    ({trip.payment.status})
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onViewTrip(trip.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </button>
                  <span className="text-gray-300">/</span>
                  <button className="text-green-600 hover:text-green-800 text-sm">
                    {trip.actions.includes('assign') ? 'Assign' : 'Send'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
