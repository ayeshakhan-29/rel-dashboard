"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../../components/auth/PrivateRoute";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users,
  MapPin,
  Clock,
  Car,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";

interface NewBooking {
  clientInfo: {
    name: string;
    phone: string;
    email: string;
    passengers: number;
    specialRequests: string;
  };
  tripDetails: {
    pickupLocation: string;
    dropoffLocation: string;
    dateTime: string;
    vehicleType: string;
    tripType: string;
  };
  pricing: {
    basePrice: number;
    additionalFees: number;
    totalPrice: number;
    paymentMethod: string;
  };
  driver: {
    assigned: boolean;
    driverId: string;
    notes: string;
  };
}

const vehicleTypes = [
  { id: "business_sedan", name: "Business Sedan", capacity: 4, basePrice: 85 },
  {
    id: "first_class_sedan",
    name: "First Class Sedan",
    capacity: 4,
    basePrice: 120,
  },
  {
    id: "first_class_suv",
    name: "First Class SUV",
    capacity: 6,
    basePrice: 150,
  },
  {
    id: "mercedes_sprinter",
    name: "Mercedes Sprinter",
    capacity: 12,
    basePrice: 180,
  },
  { id: "electric_sedan", name: "Electric Sedan", capacity: 4, basePrice: 110 },
];

const availableDrivers = [
  { id: "driver1", name: "Marcus", status: "Available", rating: 4.8 },
  { id: "driver2", name: "rimpal", status: "Available", rating: 4.9 },
  { id: "driver3", name: "Parveshpreet", status: "Available", rating: 4.7 },
];

function NewBookingContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<NewBooking>({
    clientInfo: {
      name: "",
      phone: "",
      email: "",
      passengers: 1,
      specialRequests: "",
    },
    tripDetails: {
      pickupLocation: "",
      dropoffLocation: "",
      dateTime: "",
      vehicleType: "",
      tripType: "point_to_point",
    },
    pricing: {
      basePrice: 0,
      additionalFees: 0,
      totalPrice: 0,
      paymentMethod: "cash",
    },
    driver: {
      assigned: false,
      driverId: "",
      notes: "",
    },
  });

  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateBooking = (
    section: keyof NewBooking,
    field: string,
    value: any,
  ) => {
    setBooking((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const calculatePrice = (vehicleType: string, passengers: number) => {
    const vehicle = vehicleTypes.find((v) => v.id === vehicleType);
    if (!vehicle) return 0;

    let basePrice = vehicle.basePrice;
    let additionalFees = 0;

    if (passengers > vehicle.capacity) {
      additionalFees = (passengers - vehicle.capacity) * 25;
    }

    const totalPrice = basePrice + additionalFees;

    setBooking((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        basePrice,
        additionalFees,
        totalPrice,
      },
    }));

    return totalPrice;
  };

  const handleVehicleChange = (vehicleType: string) => {
    updateBooking("tripDetails", "vehicleType", vehicleType);
    calculatePrice(vehicleType, booking.clientInfo.passengers);
  };

  const handlePassengerChange = (passengers: number) => {
    updateBooking("clientInfo", "passengers", passengers);
    if (booking.tripDetails.vehicleType) {
      calculatePrice(booking.tripDetails.vehicleType, passengers);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!booking.clientInfo.name.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (!booking.clientInfo.phone.trim()) {
      newErrors.clientPhone = "Phone number is required";
    }

    if (!booking.tripDetails.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    }

    if (!booking.tripDetails.dropoffLocation.trim()) {
      newErrors.dropoffLocation = "Dropoff location is required";
    }

    if (!booking.tripDetails.dateTime) {
      newErrors.dateTime = "Date and time are required";
    }

    if (!booking.tripDetails.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("New booking:", booking);
    router.push("/dispatch");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="New Booking" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-6xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Client Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Client Information</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={booking.clientInfo.name}
                      onChange={(e) =>
                        updateBooking("clientInfo", "name", e.target.value)
                      }
                      className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:border-blue-500 ${
                        errors.clientName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter client name"
                    />
                    {errors.clientName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.clientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={booking.clientInfo.phone}
                        onChange={(e) =>
                          updateBooking("clientInfo", "phone", e.target.value)
                        }
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:border-blue-500 ${
                          errors.clientPhone
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>
                    {errors.clientPhone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.clientPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={booking.clientInfo.email}
                        onChange={(e) =>
                          updateBooking("clientInfo", "email", e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passengers *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={booking.clientInfo.passengers}
                      onChange={(e) =>
                        handlePassengerChange(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      value={booking.clientInfo.specialRequests}
                      onChange={(e) =>
                        updateBooking(
                          "clientInfo",
                          "specialRequests",
                          e.target.value,
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Trip Details</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={booking.tripDetails.pickupLocation}
                        onChange={(e) =>
                          updateBooking(
                            "tripDetails",
                            "pickupLocation",
                            e.target.value,
                          )
                        }
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:border-blue-500 ${
                          errors.pickupLocation
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter pickup address"
                      />
                    </div>
                    {errors.pickupLocation && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pickupLocation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dropoff Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={booking.tripDetails.dropoffLocation}
                        onChange={(e) =>
                          updateBooking(
                            "tripDetails",
                            "dropoffLocation",
                            e.target.value,
                          )
                        }
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:border-blue-500 ${
                          errors.dropoffLocation
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter dropoff address"
                      />
                    </div>
                    {errors.dropoffLocation && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dropoffLocation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={booking.tripDetails.dateTime}
                        onChange={(e) =>
                          updateBooking(
                            "tripDetails",
                            "dateTime",
                            e.target.value,
                          )
                        }
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:border-blue-500 ${
                          errors.dateTime ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.dateTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dateTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      value={booking.tripDetails.vehicleType}
                      onChange={(e) => handleVehicleChange(e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:border-blue-500 ${
                        errors.vehicleType
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select vehicle</option>
                      {vehicleTypes.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} (Capacity: {vehicle.capacity}) - $
                          {vehicle.basePrice}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.vehicleType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trip Type
                    </label>
                    <select
                      value={booking.tripDetails.tripType}
                      onChange={(e) =>
                        updateBooking("tripDetails", "tripType", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="point_to_point">Point to Point</option>
                      <option value="hourly">Hourly Service</option>
                      <option value="airport"> Airport Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Driver Assignment */}
              <div className="space-y-6">
                {/* Pricing */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <span>Pricing</span>
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-medium">
                        ${booking.pricing.basePrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Fees</span>
                      <span className="font-medium">
                        ${booking.pricing.additionalFees}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">
                          Total Price
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ${booking.pricing.totalPrice}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="flex space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="cash"
                            checked={booking.pricing.paymentMethod === "cash"}
                            onChange={(e) =>
                              updateBooking(
                                "pricing",
                                "paymentMethod",
                                e.target.value,
                              )
                            }
                            className="mr-2"
                          />
                          <span>Cash</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="card"
                            checked={booking.pricing.paymentMethod === "card"}
                            onChange={(e) =>
                              updateBooking(
                                "pricing",
                                "paymentMethod",
                                e.target.value,
                              )
                            }
                            className="mr-2"
                          />
                          <span>Card</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="invoice"
                            checked={
                              booking.pricing.paymentMethod === "invoice"
                            }
                            onChange={(e) =>
                              updateBooking(
                                "pricing",
                                "paymentMethod",
                                e.target.value,
                              )
                            }
                            className="mr-2"
                          />
                          <span>Invoice</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span>Driver Assignment</span>
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="assign-driver"
                        checked={booking.driver.assigned}
                        onChange={(e) =>
                          updateBooking("driver", "assigned", e.target.checked)
                        }
                        className="rounded"
                      />
                      <label htmlFor="assign-driver" className="text-sm">
                        Assign driver now
                      </label>
                    </div>

                    {booking.driver.assigned && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Driver
                          </label>
                          <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Choose a driver</option>
                            {availableDrivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.name} - {driver.status} (⭐{" "}
                                {driver.rating})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Driver Notes
                          </label>
                          <textarea
                            value={booking.driver.notes}
                            onChange={(e) =>
                              updateBooking("driver", "notes", e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Any specific instructions for the driver..."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
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
