"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminRoute from "../../components/auth/AdminRoute";
import { getPassengers, deleteUser, updateUserById } from "@/app/services/userService";
import reservationService from "@/app/services/reservationService";
import { Search, Plus, Phone, Mail, Users, Star, Calendar, DollarSign, Edit, Trash2, Loader2 } from "lucide-react";

interface Trip { id: string; date: string; route: string; price: number; status: string; driver: string }
interface Passenger {
  id: string | number; name: string; phone: string; email?: string;
  totalTrips: number; totalSpent: number; averageRating?: number;
  lastTripDate: string | null; preferredVehicle?: string; specialRequests?: string;
  status: string; recentTrips?: Trip[];
}

const statusStyles: Record<string, string> = {
  vip:      "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900/30",
  active:   "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30",
  inactive: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
};

const tripStatusStyles: Record<string, string> = {
  completed:  "text-emerald-600 dark:text-emerald-400",
  cancelled:  "text-rose-600 dark:text-rose-400",
  confirmed:  "text-violet-600 dark:text-violet-400",
  dispatched: "text-sky-600 dark:text-sky-400",
};

function PassengerModal({ passenger, onClose }: { passenger: Passenger; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card transition-colors">
          <div>
            <h3 className="font-semibold text-foreground">{passenger.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{passenger.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-foreground text-2xl leading-none transition-colors">×</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)] bg-background/50 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Contact</h4>
                <div className="space-y-2 text-sm text-foreground/90">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{passenger.phone}</div>
                  {passenger.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{passenger.email}</div>}
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Preferences</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">Preferred Vehicle</p>
                  <p className="text-foreground/90">{passenger.preferredVehicle || 'None specified'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 uppercase font-medium">Special Requests</p>
                  <p className="text-foreground/90">{passenger.specialRequests || 'None'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Statistics</h4>
                <div className="space-y-3 text-sm">
                  {[
                    ["Total Trips",    passenger.totalTrips],
                    ["Total Spent",    `$${passenger.totalSpent}`],
                    ["Avg Rating",     `★ ${passenger.averageRating || 5.0}`],
                    ["Last Trip",      passenger.lastTripDate ? new Date(passenger.lastTripDate).toLocaleDateString() : 'Never'],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between items-center pb-2 border-b border-border/50 last:border-0 last:pb-0">
                      <span className="text-slate-500 dark:text-slate-400">{k}</span>
                      <span className="font-semibold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 border border-border shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Recent Trips</h4>
                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {passenger.recentTrips && passenger.recentTrips.length > 0 ? (
                    passenger.recentTrips.map((trip) => (
                      <div key={trip.id} className="bg-background rounded-lg p-3 border border-border hover:border-emerald-500/50 transition-all text-sm group">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase">{trip.id}</span>
                          <span className={`text-[10px] font-bold uppercase ${tripStatusStyles[trip.status] ?? "text-slate-500"}`}>{trip.status}</span>
                        </div>
                        <p className="text-foreground/90 font-medium line-clamp-1">{trip.route}</p>
                        <div className="flex justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{trip.date}</span>
                          <span className="font-bold text-foreground">${trip.price}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">No recent trips</p>
                    </div>
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

function EditPassengerModal({ passenger, onClose, onSuccess }: { passenger: Passenger; onClose: () => void; onSuccess: (updated: Passenger) => void }) {
  const [name, setName] = useState(passenger.name || "");
  const [email, setEmail] = useState(passenger.email || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { name, email };
      await updateUserById(Number(passenger.id), updateData);
      onSuccess({ ...passenger, name, email });
    } catch (err) {
      console.error("Failed to update passenger:", err);
      alert("Failed to update passenger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-foreground mb-4">Edit Passenger</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-foreground">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              {/* Optional loader icon here, omitted to avoid missing import if any */}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ passenger, onClose, onConfirm }: { passenger: Passenger; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError("Failed to delete passenger. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Delete Passenger</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">{passenger.name}</span>? This action cannot be undone.
            </p>
            {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-foreground">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
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
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [deletingPassenger, setDeletingPassenger] = useState<Passenger | null>(null);

  const handleEditSuccess = (updatedPassenger: Passenger) => {
    setPassengers((prev) => prev.map((p) => (p.id === updatedPassenger.id ? updatedPassenger : p)));
    setEditingPassenger(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPassenger) return;
    await deleteUser(Number(deletingPassenger.id));
    setPassengers((prev) => prev.filter((p) => p.id !== deletingPassenger.id));
    setDeletingPassenger(null);
  };

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
    const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = p.phone?.includes(searchQuery);
    const emailMatch = p.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchSearch = !searchQuery || nameMatch || phoneMatch || emailMatch;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inputCls = "px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Passengers" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 space-y-5 transition-colors duration-300">

          {/* Toolbar */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-wrap items-center gap-3 transition-colors">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search passengers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 ${inputCls}`} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex bg-background border border-border rounded-lg p-1">
              {(["cards", "table"] as const).map((m) => (
                <button 
                  key={m} 
                  onClick={() => setViewMode(m)} 
                  className={`px-3 py-1 rounded text-sm font-medium transition-all capitalize ${
                    viewMode === m 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-slate-800 dark:bg-emerald-600 hover:bg-slate-900 dark:hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Add Passenger
            </button>
          </div>

          {/* List view */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm transition-colors">
               <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
               <p className="text-slate-500 dark:text-slate-400 font-medium">Loading passengers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-xl border border-border shadow-sm transition-colors">
               <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
               <p className="text-slate-500 dark:text-slate-400 font-medium">No passengers found</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.name}</h3>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-tighter">ID: {p.id}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[p.status] ?? statusStyles.inactive}`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{p.phone || 'No phone'}</div>
                      {p.email && <div className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 text-slate-400" />{p.email}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] mb-2 p-3 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><Users className="w-3.5 h-3.5 text-slate-400" />{p.totalTrips} trips</div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><DollarSign className="w-3.5 h-3.5 text-slate-400" />${p.totalSpent.toLocaleString()}</div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><Star className="w-3.5 h-3.5 text-amber-500" />{p.averageRating ?? 5.0}</div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><Calendar className="w-3.5 h-3.5 text-slate-400" />{p.lastTripDate ? new Date(p.lastTripDate).toLocaleDateString() : 'None'}</div>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-border flex justify-between items-center transition-colors">
                    <button onClick={() => setSelected(p)} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-foreground transition-all uppercase tracking-wider">
                      View Details
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingPassenger(p)} className="p-1.5 bg-background hover:bg-slate-100 dark:hover:bg-slate-800 border border-border rounded transition-colors" title="Edit"><Edit className="w-3.5 h-3.5 text-slate-500" /></button>
                      <button onClick={() => setDeletingPassenger(p)} className="p-1.5 bg-background hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-border hover:border-rose-200 dark:hover:border-rose-900/30 rounded transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table view */
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto transition-colors">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                    {["Passenger", "Contact", "Trips", "Spent", "Rating", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide transition-colors">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">ID: {p.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 opacity-50" />{p.phone || '—'}</div>
                        {p.email && <div className="text-xs flex items-center gap-1.5 mt-0.5 opacity-80"><Mail className="w-3 h-3 opacity-50" />{p.email}</div>}
                      </td>
                      <td className="py-3 px-4 text-foreground/80">{p.totalTrips}</td>
                      <td className="py-3 px-4 font-medium text-foreground">${p.totalSpent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-amber-500">★ {p.averageRating ?? 5.0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[p.status] ?? statusStyles.inactive}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(p)} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-foreground transition-all uppercase tracking-wider">View</button>
                          <button onClick={() => setEditingPassenger(p)} className="p-1 container-bg hover:bg-slate-100 dark:hover:bg-slate-800 border border-border rounded transition-colors"><Edit className="w-3.5 h-3.5 text-slate-500" /></button>
                          <button onClick={() => setDeletingPassenger(p)} className="p-1 container-bg hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-border hover:border-rose-200 dark:hover:border-rose-900/30 rounded transition-colors"><Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" /></button>
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
      {editingPassenger && <EditPassengerModal passenger={editingPassenger} onClose={() => setEditingPassenger(null)} onSuccess={handleEditSuccess} />}
      {deletingPassenger && <DeleteConfirmModal passenger={deletingPassenger} onClose={() => setDeletingPassenger(null)} onConfirm={handleDeleteConfirm} />}
    </div>
  );
}

export default function PassengerManagement() {
  return <AdminRoute><PassengersContent /></AdminRoute>;
}
