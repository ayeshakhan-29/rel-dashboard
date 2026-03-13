"use client";

import { useState, useEffect } from "react";

export interface Trip {
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
  status: "unassigned" | "scheduled" | "confirmed" | "dispatched" | "in_progress" | "completed" | "cancelled";
  actions: string[];
}

export interface StatusFilter {
  key: string;
  label: string;
  count: number;
}

const mockTrips: Trip[] = [
  {
    id: "REL-40800",
    client: "Guest",
    passengers: 1,
    route: "JFK - Manhattan",
    dateTime: "2026-03-10 14:20:00",
    vehicle: "Business Sedan",
    driver: "rimpal",
    driverStatus: "Available",
    payment: { method: "Cash", status: "PENDING" },
    price: 85,
    status: "completed",
    actions: ["view", "send"]
  },
  {
    id: "REL-85589",
    client: "Parveshpreet",
    passengers: 1,
    route: "YYZ - JFK",
    dateTime: "2026-03-12 03:30:00",
    vehicle: "Mercedes Sprinter",
    driver: "Marcus",
    driverStatus: "Available",
    payment: { method: "Cash", status: "PENDING" },
    price: 180,
    status: "dispatched",
    actions: ["view", "send"]
  },
  {
    id: "REL-17556",
    client: "Parveshpreet",
    passengers: 1,
    route: "JFK - New",
    dateTime: "2026-03-17 03:40:00",
    vehicle: "First Class SUV",
    driver: "rimpal",
    driverStatus: "Available",
    payment: { method: "Cash", status: "PENDING" },
    price: 150,
    status: "cancelled",
    actions: ["view", "send"]
  },
  {
    id: "REL-29027",
    client: "Guest",
    passengers: 1,
    route: "JFK - Manhattan",
    dateTime: "2026-03-24 03:30:00",
    vehicle: "Mercedes Sprinter",
    driver: "Marcus",
    driverStatus: "Available",
    payment: { method: "Cash", status: "PENDING" },
    price: 180,
    status: "confirmed",
    actions: ["view", "send"]
  },
  {
    id: "REL-23428",
    client: "Guest",
    passengers: 1,
    route: "JFK - NY",
    dateTime: "2026-03-25 02:30:00",
    vehicle: "Electric Sedan",
    driver: "Parveshpreet",
    driverStatus: "Available",
    payment: { method: "Cash", status: "PENDING" },
    price: 110,
    status: "confirmed",
    actions: ["view", "send"]
  },
  {
    id: "REL-65331",
    client: "Parveshpreet",
    passengers: 1,
    route: "JFK - Manhattan",
    dateTime: "2026-03-28 02:30:00",
    vehicle: "First Class Sedan",
    driver: "",
    driverStatus: "",
    payment: { method: "Cash", status: "PENDING" },
    price: 120,
    status: "scheduled",
    actions: ["view", "assign"]
  },
  {
    id: "REL-26191",
    client: "Parveshpreet",
    passengers: 1,
    route: "JFK - EWR",
    dateTime: "2026-04-17 03:30:00",
    vehicle: "First Class SUV",
    driver: "Parveshpreet",
    driverStatus: "Available",
    payment: { method: "Cash", status: "PENDING" },
    price: 150,
    status: "confirmed",
    actions: ["view", "send"]
  }
];

export function useDispatchData() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [revenue, setRevenue] = useState(825);
  const [activeTrips, setActiveTrips] = useState(0);

  const statusFilters: StatusFilter[] = [
    { key: "all", label: "All Trips", count: trips.length },
    { key: "unassigned", label: "Unassigned", count: trips.filter(t => t.status === "unassigned").length },
    { key: "scheduled", label: "Scheduled", count: trips.filter(t => t.status === "scheduled").length },
    { key: "confirmed", label: "Confirmed", count: trips.filter(t => t.status === "confirmed").length },
    { key: "dispatched", label: "Dispatched", count: trips.filter(t => t.status === "dispatched").length },
    { key: "in_progress", label: "In Progress", count: trips.filter(t => t.status === "in_progress").length },
    { key: "completed", label: "Completed", count: trips.filter(t => t.status === "completed").length },
    { key: "cancelled", label: "Cancelled", count: trips.filter(t => t.status === "cancelled").length }
  ];

  const filteredTrips = trips.filter(trip => {
    const matchesFilter = activeFilter === "all" || trip.status === activeFilter;
    const matchesSearch = searchQuery === "" || 
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.route.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewTrip = (tripId: string) => {
    console.log("View trip:", tripId);
    // TODO: Open trip details modal
  };

  const handleAssignDriver = (tripId: string) => {
    console.log("Assign driver for trip:", tripId);
    // TODO: Open driver assignment modal
  };

  const handleNewTrip = () => {
    console.log("Create new trip");
    // TODO: Navigate to new trip page or open modal
  };

  return {
    trips: filteredTrips,
    allTrips: trips,
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
    setTrips
  };
}
