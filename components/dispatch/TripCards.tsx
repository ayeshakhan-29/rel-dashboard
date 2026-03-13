"use client";

import React from "react";
import { Users, MapPin, Clock, Car, User } from "lucide-react";

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

interface TripCardsProps {
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

export default function TripCards({ trips, onViewTrip, onAssignDriver }: TripCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {trips.map((trip) => (
        <div key={trip.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-mono text-sm text-gray-500">{trip.id}</div>
              <div className="font-semibold text-lg text-gray-900">{trip.client}</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          
          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{trip.passengers} passengers</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{trip.route}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{trip.dateTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{trip.vehicle}</span>
            </div>
            {trip.driver && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{trip.driver} ({trip.driverStatus})</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-green-600">${trip.price}</div>
              <div className="text-xs text-gray-500">{trip.payment.method} ({trip.payment.status})</div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => onViewTrip(trip.id)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View
              </button>
              <button 
                onClick={() => onAssignDriver(trip.id)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                {trip.actions.includes('assign') ? 'Assign' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
