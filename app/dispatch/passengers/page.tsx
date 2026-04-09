"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminRoute from "../../components/auth/AdminRoute";
import { getPassengers } from "@/app/services/userService";
import reservationService from "@/app/services/reservationService";
import { Search, Plus, Phone, Mail, Users, Star, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";

interface Trip { id: string; date: string; route: string; price: number; status: string; driver: string }
interface Passenger {
  id: string | number; name: string; phone: string; email?: string;
  totalTrips: number; totalSpent: number; averageRating?: number;
  lastTripDate: string | null; preferredVehicle?: string; specialRequests?: string;
  status: string; recentTrips?: Trip[];
}

const statusStyles: Record<string, string> = {
  vip:      "text-violet-700 bg-violet-50 border border-violet-200",
  active:   "text-emerald-700 bg-emerald-50 border border-emerald-200",
  inactive: "text-slate-600 bg-slate-100 border border-slate-200",
};

const tripStatusStyles: Record<string, string> = {
  completed:  "text-emerald-600",
  cancelled:  "text-rose-600",
  confirmed:  "text-violet-600",
  dispatched: "text-sky-600",
};

function PassengerModal({ passenger, onClose }: { passenger: Passenger; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">{passenger.name}</h3>
            <p className="text-xs text-slate-400">{passenger.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{passenger.phone}</div>
                  {passenger.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{passenger.email}</div>}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Preferences</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-500 text-xs">Preferred Vehicle</p>
                  <p className="text-slate-700">{passenger.preferredVehicle}</p>
                  <p className="text-slate-500 text-xs mt-2">Special Requests</p>
                  <p className="text-slate-700">{passenger.specialRequests}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  {[
                    ["Total Trips",    passenger.totalTrips],
                    ["Total Spent",    `$${passenger.totalSpent}`],
                    ["Avg Rating",     `★ ${passenger.averageRating}`],
                    ["Last Trip",      passenger.lastTripDate],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Trips</h4>
                <div className="space-y-2">
                  {passenger.recentTrips && passenger.recentTrips.length > 0 ? (
                    passenger.recentTrips.map((trip) => (
                      <div key={trip.id} className="bg-white rounded-lg p-3 border border-slate-200 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-xs text-slate-400">{trip.id}</span>
                          <span className={`text-xs font-medium ${tripStatusStyles[trip.status] ?? "text-slate-500"}`}>{trip.status}</span>
                        </div>
                        <p className="text-slate-700">{trip.route}</p>
                        <div className="flex justify-between mt-1 text-xs text-slate-500">
                          <span>{trip.date}</span>
                          <span className="font-semibold text-slate-700">${trip.price}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No recent trips</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassengersContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selected, setSelected] = useState<Passenger | null>(null);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        setLoading(true);
        const response = await getPassengers();
        setPassengers(response.data || []);
      } catch (err) {
        console.error('Failed to fetch passengers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassengers();
  }, []);

  const filtered = passengers.filter((p) => {
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.phone && p.phone.includes(searchQuery)) || 
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inputCls = "px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Passengers" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search passengers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 ${inputCls}`} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(["cards", "table"] as const).map((m) => (
                <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${viewMode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{m}</button>
              ))}
            </div>
            <button className="px-3 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Passenger
            </button>
          </div>

          {/* Cards view */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
               <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 font-medium">Loading passengers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
               <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
               <p className="text-slate-500 font-medium">No passengers found</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">{p.name}</h3>
                        <p className="text-xs text-slate-400">ID: {p.id}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[p.status] ?? statusStyles.inactive}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{p.phone || 'No phone'}</div>
                      {p.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{p.email}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1.5 text-slate-600"><Users className="w-3.5 h-3.5 text-slate-400" />{p.totalTrips} trips</div>
                      <div className="flex items-center gap-1.5 text-slate-600"><DollarSign className="w-3.5 h-3.5 text-slate-400" />${p.totalSpent.toLocaleString()}</div>
                      <div className="flex items-center gap-1.5 text-slate-600"><Star className="w-3.5 h-3.5 text-amber-400" />{p.averageRating ?? 5.0}</div>
                      <div className="flex items-center gap-1.5 text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400" />{p.lastTripDate ? new Date(p.lastTripDate).toLocaleDateString() : 'No trips'}</div>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center">
                    <button onClick={() => setSelected(p)} className="text-xs font-medium text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline">
                      View Details
                    </button>
                    <div className="flex gap-1">
                      <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded transition-colors"><Edit className="w-3.5 h-3.5 text-slate-600" /></button>
                      <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded transition-colors"><Trash2 className="w-3.5 h-3.5 text-slate-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table view */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Passenger", "Contact", "Trips", "Spent", "Rating", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">ID: {p.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{p.phone || 'No phone'}</div>
                        {p.email && <div className="text-xs text-slate-400">{p.email}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.totalTrips}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">${p.totalSpent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-700">★ {p.averageRating ?? 5.0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[p.status] ?? statusStyles.inactive}`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(p)} className="text-xs font-medium text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline">View</button>
                          <button className="p-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"><Edit className="w-3.5 h-3.5 text-slate-600" /></button>
                          <button className="p-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"><Trash2 className="w-3.5 h-3.5 text-slate-600" /></button>
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

      {selected && <PassengerModal passenger={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function PassengerManagement() {
  return <AdminRoute><PassengersContent /></AdminRoute>;
}
