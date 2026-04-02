import { useState, useEffect, useCallback } from "react";
import reservationService from "@/app/services/reservationService";
import { Reservation } from "@/types/reservation.types";
import { useRouter } from "next/navigation";

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
  dbId: number;
}

export interface StatusFilter {
  key: string;
  label: string;
  count: number;
}



export function useDispatchData() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [revenue, setRevenue] = useState(0);
  const [activeTrips, setActiveTrips] = useState(0);

  const mapReservationToTrip = useCallback((res: Reservation): Trip => {
    return {
      id: res.reservation_number,
      client: res.passenger_name,
      passengers: res.passenger_count,
      route: `${res.pickup_location.split(',')[0]} → ${res.dropoff_location.split(',')[0]}`,
      dateTime: `${new Date(res.pickup_date).toLocaleDateString()} ${res.pickup_time.substring(0, 5)}`,
      vehicle: res.vehicle_type || "Standard Sedan",
      driver: res.driver_name || "",
      driverStatus: res.driver_name ? "Assigned" : "Unassigned",
      payment: {
        method: res.booking_type === 'contract' ? 'Contract' : 'Cash/Card',
        status: res.payment_status.toUpperCase()
      },
      price: Number(res.price),
      status: mapStatus(res.reservation_status),
      actions: res.assigned_driver_id ? ["view", "send"] : ["view", "assign"],
      dbId: res.id
    };
  }, []);

  const mapStatus = (status: string): Trip["status"] => {
    switch (status) {
      case 'pending': return 'unassigned';
      case 'pending_driver_approval': return 'scheduled';
      case 'assigned': return 'confirmed';
      case 'confirmed': return 'confirmed';
      case 'in_progress': return 'in_progress';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'rejected': return 'cancelled';
      case 'driver_denied': return 'unassigned';
      default: return 'unassigned';
    }
  };

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reservationService.getReservations({ limit: 100 });
      const realTrips = response.data.map(mapReservationToTrip);
      setTrips(realTrips);
      
      // Calculate stats
      const totalRevenue = response.data
        .filter(r => r.reservation_status === 'completed')
        .reduce((sum, r) => sum + Number(r.price), 0);
      setRevenue(totalRevenue);
      
      const ongoing = response.data.filter(r => 
        ['assigned', 'confirmed', 'in_progress'].includes(r.reservation_status)
      ).length;
      setActiveTrips(ongoing);
      
    } catch (error) {
      console.error("Error fetching dispatch trips:", error);
    } finally {
      setLoading(false);
    }
  }, [mapReservationToTrip]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const statusFilters: StatusFilter[] = [
    { key: "all", label: "All Trips", count: trips.length },
    { key: "unassigned", label: "Unassigned", count: trips.filter(t => t.status === "unassigned").length },
    { key: "scheduled", label: "Scheduled", count: trips.filter(t => t.status === "scheduled").length },
    { key: "confirmed", label: "Confirmed", count: trips.filter(t => t.status === "confirmed").length },
    { key: "dispatched", label: "Dispatched", count: trips.filter(t => t.status === "dispatched").length },
    { key: "in_progress", label: "On Trip", count: trips.filter(t => t.status === "in_progress").length },
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
    // We need the numeric DB ID to navigate.
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      router.push(`/reservations/${trip.dbId}`);
    }
  };

  const handleAssignDriver = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      router.push(`/dispatch/assign?reservation=${trip.dbId}`);
    }
  };

  const handleNewTrip = () => {
    router.push('/reservations/new');
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
    setTrips,
    loading
  };
}
