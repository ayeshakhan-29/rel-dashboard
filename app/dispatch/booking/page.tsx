"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../../components/auth/PrivateRoute";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, MapPin, Calendar, DollarSign, User, Phone, Mail } from "lucide-react";

interface NewBooking {
  clientInfo: { name: string; phone: string; email: string; passengers: number; specialRequests: string };
  tripDetails: { pickupLocation: string; dropoffLocation: string; dateTime: string; vehicleType: string; tripType: string };
  pricing: { basePrice: number; additionalFees: number; totalPrice: number; paymentMethod: string };
  driver: { assigned: boolean; driverId: string; notes: string };
}

const vehicleTypes = [
  { id: "business_sedan",    name: "Business Sedan",    capacity: 4,  basePrice: 85  },
  { id: "first_class_sedan", name: "First Class Sedan", capacity: 4,  basePrice: 120 },
  { id: "first_class_suv",   name: "First Class SUV",   capacity: 6,  basePrice: 150 },
  { id: "mercedes_sprinter", name: "Mercedes Sprinter", capacity: 12, basePrice: 180 },
  { id: "electric_sedan",    name: "Electric Sedan",    capacity: 4,  basePrice: 110 },
];

const availableDrivers = [
  { id: "driver1", name: "Marcus",       status: "Available", rating: 4.8 },
  { id: "driver2", name: "Rimpal",       status: "Available", rating: 4.9 },
  { id: "driver3", name: "Parveshpreet", status: "Available", rating: 4.7 },
];

const inputCls = (error?: string) =>
  `w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 ${
    error ? "border-rose-400" : "border-slate-300"
  }`;

const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

function NewBookingContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const [booking, setBooking] = useState<NewBooking>({
    clientInfo:  { name: "", phone: "", email: "", passengers: 1, specialRequests: "" },
    tripDetails: { pickupLocation: "", dropoffLocation: "", dateTime: "", vehicleType: "", tripType: "point_to_point" },
    pricing:     { basePrice: 0, additionalFees: 0, totalPrice: 0, paymentMethod: "cash" },
    driver:      { assigned: false, driverId: "", notes: "" },
  });

  const [selectedDriver, setSelectedDriver] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (section: keyof NewBooking, field: string, value: any) =>
    setBooking((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const recalcPrice = (vehicleType: string, passengers: number) => {
    const v = vehicleTypes.find((x) => x.id === vehicleType);
    if (!v) return;
    const additionalFees = passengers > v.capacity ? (passengers - v.capacity) * 25 : 0;
    setBooking((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, basePrice: v.basePrice, additionalFees, totalPrice: v.basePrice + additionalFees },
    }));
  };

  const handleVehicleChange = (vehicleType: string) => {
    update("tripDetails", "vehicleType", vehicleType);
    recalcPrice(vehicleType, booking.clientInfo.passengers);
  };

  const handlePassengerChange = (passengers: number) => {
    update("clientInfo", "passengers", passengers);
    if (booking.tripDetails.vehicleType) recalcPrice(booking.tripDetails.vehicleType, passengers);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!booking.clientInfo.name.trim())              e.clientName      = "Required";
    if (!booking.clientInfo.phone.trim())             e.clientPhone     = "Required";
    if (!booking.tripDetails.pickupLocation.trim())   e.pickupLocation  = "Required";
    if (!booking.tripDetails.dropoffLocation.trim())  e.dropoffLocation = "Required";
    if (!booking.tripDetails.dateTime)                e.dateTime        = "Required";
    if (!booking.tripDetails.vehicleType)             e.vehicleType     = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    router.push("/dispatch");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="New Booking" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Client Information */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Client Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      type="text"
                      value={booking.clientInfo.name}
                      onChange={(e) => update("clientInfo", "name", e.target.value)}
                      className={inputCls(errors.clientName)}
                      placeholder="Client full name"
                    />
                    {errors.clientName && <p className="text-rose-500 text-xs mt-1">{errors.clientName}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={booking.clientInfo.phone}
                        onChange={(e) => update("clientInfo", "phone", e.target.value)}
                        className={`${inputCls(errors.clientPhone)} pl-9`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    {errors.clientPhone && <p className="text-rose-500 text-xs mt-1">{errors.clientPhone}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={booking.clientInfo.email}
                        onChange={(e) => update("clientInfo", "email", e.target.value)}
                        className={`${inputCls()} pl-9`}
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Passengers *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={booking.clientInfo.passengers}
                      onChange={(e) => handlePassengerChange(parseInt(e.target.value))}
                      className={inputCls()}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Special Requests</label>
                    <textarea
                      value={booking.clientInfo.specialRequests}
                      onChange={(e) => update("clientInfo", "specialRequests", e.target.value)}
                      rows={3}
                      className={`${inputCls()} resize-none`}
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Trip Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Pickup Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={booking.tripDetails.pickupLocation}
                        onChange={(e) => update("tripDetails", "pickupLocation", e.target.value)}
                        className={`${inputCls(errors.pickupLocation)} pl-9`}
                        placeholder="Pickup address"
                      />
                    </div>
                    {errors.pickupLocation && <p className="text-rose-500 text-xs mt-1">{errors.pickupLocation}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Dropoff Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={booking.tripDetails.dropoffLocation}
                        onChange={(e) => update("tripDetails", "dropoffLocation", e.target.value)}
                        className={`${inputCls(errors.dropoffLocation)} pl-9`}
                        placeholder="Dropoff address"
                      />
                    </div>
                    {errors.dropoffLocation && <p className="text-rose-500 text-xs mt-1">{errors.dropoffLocation}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Date & Time *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={booking.tripDetails.dateTime}
                        onChange={(e) => update("tripDetails", "dateTime", e.target.value)}
                        className={`${inputCls(errors.dateTime)} pl-9`}
                      />
                    </div>
                    {errors.dateTime && <p className="text-rose-500 text-xs mt-1">{errors.dateTime}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Vehicle Type *</label>
                    <select
                      value={booking.tripDetails.vehicleType}
                      onChange={(e) => handleVehicleChange(e.target.value)}
                      className={inputCls(errors.vehicleType)}
                    >
                      <option value="">Select vehicle</option>
                      {vehicleTypes.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} — {v.capacity} pax · ${v.basePrice}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleType && <p className="text-rose-500 text-xs mt-1">{errors.vehicleType}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Trip Type</label>
                    <select
                      value={booking.tripDetails.tripType}
                      onChange={(e) => update("tripDetails", "tripType", e.target.value)}
                      className={inputCls()}
                    >
                      <option value="point_to_point">Point to Point</option>
                      <option value="hourly">Hourly Service</option>
                      <option value="airport">Airport Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Pricing */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Pricing</h2>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Price</span>
                      <span className="font-medium text-slate-800">${booking.pricing.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Additional Fees</span>
                      <span className="font-medium text-slate-800">${booking.pricing.additionalFees}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-800">Total</span>
                      <span className="font-bold text-slate-900 text-base">${booking.pricing.totalPrice}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={labelCls}>Payment Method</label>
                    <div className="flex gap-4 mt-1">
                      {["cash", "card", "invoice"].map((method) => (
                        <label key={method} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            value={method}
                            checked={booking.pricing.paymentMethod === method}
                            onChange={(e) => update("pricing", "paymentMethod", e.target.value)}
                            className="accent-slate-800"
                          />
                          <span className="text-sm text-slate-700 capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <User className="w-4 h-4 text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Driver Assignment</h2>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={booking.driver.assigned}
                      onChange={(e) => update("driver", "assigned", e.target.checked)}
                      className="accent-slate-800 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">Assign driver now</span>
                  </label>

                  {booking.driver.assigned && (
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Select Driver</label>
                        <select
                          value={selectedDriver}
                          onChange={(e) => setSelectedDriver(e.target.value)}
                          className={inputCls()}
                        >
                          <option value="">Choose a driver</option>
                          {availableDrivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} — {d.status} · ★ {d.rating}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Driver Notes</label>
                        <textarea
                          value={booking.driver.notes}
                          onChange={(e) => update("driver", "notes", e.target.value)}
                          rows={2}
                          className={`${inputCls()} resize-none`}
                          placeholder="Instructions for the driver..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    Create Booking
                  </button>
                </div>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NewBooking() {
  return (
    <PrivateRoute>
      <NewBookingContent />
    </PrivateRoute>
  );
}
