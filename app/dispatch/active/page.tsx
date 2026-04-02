"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "@/app/components/auth/PrivateRoute";
import {
  MapPin,
  Clock,
  User,
  Car,
  Phone,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import api from "@/app/services/api";
import Link from "next/link";

interface ActiveTrip {
  id: number;
  reservation_number: string;
  reservation_status: "assigned" | "pending_driver_approval" | "in_progress";
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_count: number;
  price: number;
  payment_status: string;
  booking_type: string;
  trip_type: string;
  updated_at: string;
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
  driver_status: string | null;
  vehicle_label: string | null;
  vehicle_code: string | null;
}

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  in_progress: {
    label: "On Trip",
    className: "text-orange-700 bg-orange-50 border border-orange-200",
    dot: "bg-orange-500",
  },
  assigned: {
    label: "Assigned",
    className: "text-sky-700 bg-sky-50 border border-sky-200",
    dot: "bg-sky-500",
  },
  pending_driver_approval: {
    label: "Pending Approval",
    className: "text-amber-700 bg-amber-50 border border-amber-200",
    dot: "bg-amber-500",
  },
};

const paymentStyles: Record<string, string> = {
  paid: "text-emerald-600",
  pending: "text-amber-600",
  failed: "text-rose-600",
};

function formatTime(time: string) {
  if (!time) return "—";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ActiveTripsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trips, setTrips] = useState<ActiveTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchActiveTrips = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/dispatch/active");
      setTrips(res.data.data ?? []);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load active trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveTrips();
    const interval = setInterval(fetchActiveTrips, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveTrips]);

  const inProgress = trips.filter((t) => t.reservation_status === "in_progress");
  const assigned = trips.filter((t) => t.reservation_status === "assigned");
  const pendingApproval = trips.filter(
    (t) => t.reservation_status === "pending_driver_approval"
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Active Trips"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* Sub-header */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <StatPill
                  dot="bg-orange-500"
                  label="On Trip"
                  count={inProgress.length}
                />
                <StatPill
                  dot="bg-sky-500"
                  label="Assigned"
                  count={assigned.length}
                />
                <StatPill
                  dot="bg-amber-500"
                  label="Pending Approval"
                  count={pendingApproval.length}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => { setLoading(true); fetchActiveTrips(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Loading active trips...
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {!loading && !error && trips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Car className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">No active trips right now</p>
                <p className="text-xs mt-1">
                  Trips will appear here once assigned or on trip
                </p>
                <Link
                  href="/dispatch/assign"
                  className="mt-4 px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Assign a Driver
                </Link>
              </div>
            )}

            {!loading && !error && trips.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatPill({
  dot,
  label,
  count,
}: {
  dot: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-600">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="font-medium">{count}</span>
      <span className="text-slate-400 hidden sm:inline">{label}</span>
    </div>
  );
}

function TripCard({ trip }: { trip: ActiveTrip }) {
  const cfg = statusConfig[trip.reservation_status] ?? statusConfig.assigned;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-slate-400">
            {trip.reservation_number}
          </p>
          <p className="font-semibold text-slate-800 mt-0.5">
            {trip.passenger_name}
          </p>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-start gap-2 text-slate-700">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" />
          <span className="line-clamp-1">{trip.pickup_location}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-500">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-rose-400 shrink-0" />
          <span className="line-clamp-1">{trip.dropoff_location}</span>
        </div>
      </div>

      {/* Date / Time */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5" />
        {formatDate(trip.pickup_date)} · {formatTime(trip.pickup_time)}
      </div>

      <div className="border-t border-slate-100" />

      {/* Driver & Vehicle */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {trip.driver_name ? (
            <span>{trip.driver_name}</span>
          ) : (
            <span className="text-slate-400 italic">No driver assigned</span>
          )}
          {trip.driver_phone && (
            <a
              href={`tel:${trip.driver_phone}`}
              className="ml-auto text-slate-400 hover:text-slate-700"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {trip.vehicle_label ?? <span className="italic">No vehicle</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-semibold text-slate-800">
          ${Number(trip.price).toFixed(2)}
        </span>
        <span
          className={`text-xs font-medium capitalize ${
            paymentStyles[trip.payment_status] ?? "text-slate-500"
          }`}
        >
          {trip.payment_status}
        </span>
        <Link
          href={`/reservations/${trip.id}`}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 underline-offset-2 hover:underline"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

export default function ActiveTripsPage() {
  return (
    <PrivateRoute>
      <ActiveTripsContent />
    </PrivateRoute>
  );
}
