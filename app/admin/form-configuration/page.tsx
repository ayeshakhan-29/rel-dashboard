'use client';

import React, { useState, useEffect } from 'react';
import AdminRoute from '../../components/auth/AdminRoute';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
    getVehicles,
    getRateConfig,
    saveVehicle,
    updateRateConfig,
    Vehicle,
    RateConfig
} from '../../services/formsService';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    Car,
    DollarSign,
    Settings,
    Eye,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    RefreshCw
} from 'lucide-react';

function FormConfigurationContent() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'vehicles' | 'pricing' | 'rates' | 'behavior'>('vehicles');

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [rateConfig, setRateConfig] = useState<RateConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Vehicle Modal State
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vehiclesData, ratesData] = await Promise.all([
                getVehicles(),
                getRateConfig()
            ]);
            setVehicles(vehiclesData);
            setRateConfig(ratesData);
        } catch (err) {
            console.error('Failed to fetch configuration:', err);
            setMessage({ type: 'error', text: 'Failed to load configuration data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVehicle) return;

        setSaving(true);
        try {
            await saveVehicle(editingVehicle);
            setMessage({ type: 'success', text: 'Vehicle saved successfully.' });
            setIsVehicleModalOpen(false);
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save vehicle.' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRates = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rateConfig) return;
        saveConfig(rateConfig);
    };

    const handleSaveBehavior = async () => {
        if (!rateConfig) return;
        saveConfig(rateConfig);
    };

    const saveConfig = async (config: RateConfig) => {
        setSaving(true);
        try {
            await updateRateConfig(config);
            setMessage({ type: 'success', text: 'Configuration updated successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update configuration.' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleServiceType = (type: string) => {
        if (!rateConfig) return;
        const current = rateConfig.enabled_service_types || [];
        const newTypes = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        setRateConfig({ ...rateConfig, enabled_service_types: newTypes });
    };

    const handleToggleVehicleClass = (vehicle: Partial<Vehicle>, serviceClass: string) => {
        const currentClasses = vehicle.service_classes || [];
        const newClasses = currentClasses.includes(serviceClass)
            ? currentClasses.filter(c => c !== serviceClass)
            : [...currentClasses, serviceClass];

        setEditingVehicle({ ...vehicle, service_classes: newClasses });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notification Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="flex-1 font-medium">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Quick Actions / Header Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Configure Your Booking Experience</h2>
                    <p className="text-sm text-slate-500">Fine-tune vehicles, pricing models, and form behavior.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {activeTab === 'vehicles' && (
                        <button
                            onClick={() => {
                                setEditingVehicle({
                                    label: '',
                                    slug: '',
                                    passenger_capacity: 4,
                                    luggage_capacity: 2,
                                    is_active: true,
                                    features: [],
                                    service_classes: ['hourly', 'airport'],
                                    pricing: { base_rate: 0, per_mile: 0, per_hour: 0, per_minute: 0 }
                                } as any);
                                setIsVehicleModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Vehicle
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide flex-nowrap">
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-4 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'vehicles' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }`}
                    >
                        <Car className="w-4 h-4" />
                        Vehicles
                    </button>
                    <button
                        onClick={() => setActiveTab('pricing')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-4 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'pricing' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }`}
                    >
                        <DollarSign className="w-4 h-4" />
                        Pricing
                    </button>
                    <button
                        onClick={() => setActiveTab('rates')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-4 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'rates' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Global Rates
                    </button>
                    <button
                        onClick={() => setActiveTab('behavior')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-4 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'behavior' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        Form Behavior
                    </button>
                </div>

                <div className="p-6">
                    {/* Vehicles Tab */}
                    {activeTab === 'vehicles' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                                                <Car className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingVehicle({ ...vehicle });
                                                        setIsVehicleModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{vehicle.label}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{vehicle.description}</p>

                                        <div className="flex items-center gap-4 mt-4 py-3 border-y border-gray-50">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <span className="font-semibold">{vehicle.passenger_capacity}</span> 👥
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <span className="font-semibold">{vehicle.luggage_capacity}</span> 🧳
                                            </div>
                                            <div className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase ${vehicle.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {vehicle.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Available for:</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {vehicle.service_classes?.map(sc => (
                                                    <span key={sc} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-medium capitalize">
                                                        {sc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle</th>
                                        <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Base Rate</th>
                                        <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Per Mile</th>
                                        <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Per Hour</th>
                                        <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Per Minute</th>
                                        <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((v) => (
                                        <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-gray-900">{v.label}</td>
                                            <td className="py-4 px-4 text-gray-600">${Number(v.base_rate || 0).toFixed(2)}</td>
                                            <td className="py-4 px-4 text-gray-600">${Number(v.per_mile || 0).toFixed(2)}/mi</td>
                                            <td className="py-4 px-4 text-gray-600">${Number(v.per_hour || 0).toFixed(2)}/hr</td>
                                            <td className="py-4 px-4 text-gray-600">${Number(v.per_minute || 0).toFixed(2)}/min</td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => {
                                                        setEditingVehicle({ ...v });
                                                        setIsVehicleModalOpen(true);
                                                    }}
                                                    className="text-emerald-600 hover:underline text-sm font-medium"
                                                >
                                                    Edit Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Rates Tab */}
                    {activeTab === 'rates' && rateConfig && (
                        <form onSubmit={handleUpdateRates} className="max-w-4xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Tax Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.0001"
                                            value={rateConfig.tax_rate * 100}
                                            onChange={(e) => setRateConfig({ ...rateConfig, tax_rate: parseFloat(e.target.value) / 100 })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">Current: {(Number(rateConfig.tax_rate || 0) * 100).toFixed(2)}%</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">CC Fee (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.0001"
                                            value={rateConfig.cc_fee_rate * 100}
                                            onChange={(e) => setRateConfig({ ...rateConfig, cc_fee_rate: parseFloat(e.target.value) / 100 })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Base Gratuity (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.01"
                                            value={rateConfig.gratuity_rate * 100}
                                            onChange={(e) => setRateConfig({ ...rateConfig, gratuity_rate: parseFloat(e.target.value) / 100 })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Service Type Multipliers</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    {Object.entries(rateConfig.service_multipliers).map(([key, val]) => (
                                        <div key={key} className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{key}</label>
                                            <input
                                                type="number" step="0.05"
                                                value={val}
                                                onChange={(e) => setRateConfig({
                                                    ...rateConfig,
                                                    service_multipliers: {
                                                        ...rateConfig.service_multipliers,
                                                        [key]: parseFloat(e.target.value)
                                                    }
                                                })}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                                >
                                    {saving ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save All Rate Config
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Behavior Tab */}
                    {activeTab === 'behavior' && (
                        <div className="max-w-2xl space-y-8">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>These settings control which service types are visible to passengers in the booking form.</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Enabled Service Types</h3>
                                <div className="space-y-3">
                                    {['hourly', 'airport', 'event', 'corporate'].map(type => (
                                        <label key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                                    {type === 'hourly' && <Settings className="w-4 h-4 text-emerald-600" />}
                                                    {type === 'airport' && <Car className="w-4 h-4 text-emerald-600" />}
                                                    {type === 'event' && <Plus className="w-4 h-4 text-emerald-600" />}
                                                    {type === 'corporate' && <Car className="w-4 h-4 text-emerald-600" />}
                                                </div>
                                                <span className="font-bold text-gray-700 capitalize">{type}</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={rateConfig?.enabled_service_types?.includes(type)}
                                                    onChange={() => handleToggleServiceType(type)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-6">
                                <button
                                    onClick={handleSaveBehavior}
                                    disabled={saving}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Behavior Settings'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Vehicle Editor Modal */}
            {isVehicleModalOpen && editingVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingVehicle.id ? `Edit ${editingVehicle.label}` : 'Add New Vehicle'}
                                </h2>
                                <p className="text-sm text-gray-500">Configure vehicle details and pricing</p>
                            </div>
                            <button onClick={() => setIsVehicleModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveVehicle} className="max-h-[80vh] overflow-y-auto">
                            <div className="p-8 space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Vehicle Label</label>
                                        <input
                                            required
                                            value={editingVehicle.label}
                                            onChange={(e) => setEditingVehicle({ ...editingVehicle, label: e.target.value })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                            placeholder="e.g. Economy Sedan"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Internal Slug (URL safe)</label>
                                        <input
                                            required
                                            value={editingVehicle.slug}
                                            onChange={(e) => setEditingVehicle({ ...editingVehicle, slug: e.target.value })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                            placeholder="e.g. economy-sedan"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Description</label>
                                        <textarea
                                            value={editingVehicle.description}
                                            onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 h-24 text-slate-900"
                                            placeholder="Tell customers about this vehicle..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Passenger Capacity</label>
                                        <input
                                            type="number"
                                            value={editingVehicle.passenger_capacity}
                                            onChange={(e) => setEditingVehicle({ ...editingVehicle, passenger_capacity: parseInt(e.target.value) })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Luggage Capacity</label>
                                        <input
                                            type="number"
                                            value={editingVehicle.luggage_capacity}
                                            onChange={(e) => setEditingVehicle({ ...editingVehicle, luggage_capacity: parseInt(e.target.value) })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        Vehicle Pricing
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Base Rate</label>
                                            <input
                                                type="number" step="0.01"
                                                value={editingVehicle?.base_rate ?? editingVehicle?.pricing?.base_rate ?? 0}
                                                onChange={(e) => setEditingVehicle({
                                                    ...editingVehicle,
                                                    pricing: { ...(editingVehicle?.pricing || { base_rate: 0, per_mile: 0, per_hour: 0, per_minute: 0 }), base_rate: parseFloat(e.target.value) },
                                                    base_rate: parseFloat(e.target.value)
                                                } as any)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Per Mile</label>
                                            <input
                                                type="number" step="0.01"
                                                value={editingVehicle?.per_mile ?? editingVehicle?.pricing?.per_mile ?? 0}
                                                onChange={(e) => setEditingVehicle({
                                                    ...editingVehicle,
                                                    pricing: { ...(editingVehicle?.pricing || { base_rate: 0, per_mile: 0, per_hour: 0, per_minute: 0 }), per_mile: parseFloat(e.target.value) },
                                                    per_mile: parseFloat(e.target.value)
                                                } as any)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Per Hour</label>
                                            <input
                                                type="number" step="0.01"
                                                value={editingVehicle?.per_hour ?? editingVehicle?.pricing?.per_hour ?? 0}
                                                onChange={(e) => setEditingVehicle({
                                                    ...editingVehicle,
                                                    pricing: { ...(editingVehicle?.pricing || { base_rate: 0, per_mile: 0, per_hour: 0, per_minute: 0 }), per_hour: parseFloat(e.target.value) },
                                                    per_hour: parseFloat(e.target.value)
                                                } as any)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Per Minute</label>
                                            <input
                                                type="number" step="0.01"
                                                value={editingVehicle?.per_minute ?? editingVehicle?.pricing?.per_minute ?? 0}
                                                onChange={(e) => setEditingVehicle({
                                                    ...editingVehicle,
                                                    pricing: { ...(editingVehicle?.pricing || { base_rate: 0, per_mile: 0, per_hour: 0, per_minute: 0 }), per_minute: parseFloat(e.target.value) },
                                                    per_minute: parseFloat(e.target.value)
                                                } as any)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Service Classes & Active Toggle */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700">Available For Service Types</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['hourly', 'airport', 'event', 'corporate'].map(sc => (
                                                <button
                                                    key={sc}
                                                    type="button"
                                                    onClick={() => handleToggleVehicleClass(editingVehicle, sc)}
                                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${editingVehicle.service_classes?.includes(sc)
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                            : 'bg-white border-gray-200 text-gray-500'
                                                        }`}
                                                >
                                                    {sc.charAt(0).toUpperCase() + sc.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700">Visibility & Order</label>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingVehicle.is_active}
                                                        onChange={(e) => setEditingVehicle({ ...editingVehicle, is_active: e.target.checked })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-12 h-6 rounded-full transition-colors ${editingVehicle.is_active ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${editingVehicle.is_active ? 'translate-x-6' : ''}`}></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Active / Visible</span>
                                            </label>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Display Order</span>
                                                <input
                                                    type="number"
                                                    value={editingVehicle.sort_order}
                                                    onChange={(e) => setEditingVehicle({ ...editingVehicle, sort_order: parseInt(e.target.value) })}
                                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={() => setIsVehicleModalOpen(false)}
                                    className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-white transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto px-10 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FormConfigurationPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AdminRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        title="Form Configuration"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            <FormConfigurationContent />
                        </div>
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}


