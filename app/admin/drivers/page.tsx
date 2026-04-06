'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAuth } from '@/app/context/AuthContext';
import AdminRoute from '@/app/components/auth/AdminRoute';
import { getDrivers, deleteDriver, updateDriver, Driver, UpdateDriverData } from '@/app/services/driversService';
import { Plus, Loader2, Trash2, Edit, X, Save, LayoutGrid, List, Phone, Mail, User, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function DriversPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [deletingDriverId, setDeletingDriverId] = useState<number | null>(null);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editFormData, setEditFormData] = useState<UpdateDriverData>({});
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                setLoading(true);
                const response = await getDrivers();
                setDrivers(response.data?.drivers || []);
            } catch (error: any) {
                console.error('Failed to load drivers:', error);
                setApiError(error.response?.data?.message || 'Unable to fetch drivers.');
            } finally {
                setLoading(false);
            }
        };

        loadDrivers();
    }, []);

    const handleDelete = async (driverId: number) => {
        if (!confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingDriverId(driverId);
            await deleteDriver(driverId);
            setDrivers((current) => current.filter((driver) => driver.id !== driverId));
        } catch (error: any) {
            console.error('Driver deletion error:', error);
            setApiError(error.response?.data?.message || 'Unable to delete driver.');
        } finally {
            setDeletingDriverId(null);
        }
    };

    const handleEditClick = (driver: Driver) => {
        // Format license_expiry to YYYY-MM-DD for the date input
        let formattedExpiry = '';
        if (driver.license_expiry) {
            try {
                formattedExpiry = new Date(driver.license_expiry).toISOString().split('T')[0];
            } catch (e) {
                console.warn('Invalid license_expiry date:', driver.license_expiry);
            }
        }

        setEditingDriver(driver);
        setEditFormData({
            name: driver.name,
            phone: driver.phone || '',
            license_number: driver.license_number || '',
            license_expiry: formattedExpiry,
            status: driver.status,
            vehicle_id: driver.vehicle_id
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDriver) return;

        try {
            setUpdateLoading(true);
            const response = await updateDriver(editingDriver.id, editFormData);
            
            // Update the drivers list with the new data
            setDrivers((current) => 
                current.map((d) => d.id === editingDriver.id ? response.data.driver : d)
            );
            
            setIsEditModalOpen(false);
            setEditingDriver(null);
        } catch (error: any) {
            console.error('Driver update error:', error);
            alert(error.response?.data?.message || 'Failed to update driver.');
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <AdminRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Drivers" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">Driver Management</h1>
                                    <p className="mt-1 text-sm text-slate-500">View active driver profiles and their license details.</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                viewMode === 'table' 
                                                    ? 'bg-white text-slate-900 shadow-sm' 
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <List className="h-4 w-4" />
                                            List
                                        </button>
                                        <button
                                            onClick={() => setViewMode('cards')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                viewMode === 'cards' 
                                                    ? 'bg-white text-slate-900 shadow-sm' 
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                            Cards
                                        </button>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => router.push('/admin/drivers/register')}
                                            className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Register Driver
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                                    </div>
                                ) : apiError ? (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                        {apiError}
                                    </div>
                                ) : drivers.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                                        No drivers have been registered yet.
                                    </div>
                                ) : viewMode === 'table' ? (
                                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-200">
                                            <h2 className="text-lg font-semibold text-slate-900">Driver list</h2>
                                            <p className="mt-1 text-sm text-slate-500">All registered drivers appear here.</p>
                                        </div>
                                        <div className="p-6">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-left text-sm text-slate-600">
                                                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                                                        <tr>
                                                            <th className="px-4 py-3 font-medium">Name</th>
                                                            <th className="px-4 py-3 font-medium">Email/Phone</th>
                                                            <th className="px-4 py-3 font-medium">License</th>
                                                            <th className="px-4 py-3 font-medium">Status</th>
                                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {drivers.map((driver) => (
                                                            <tr 
                                                                key={driver.id} 
                                                                className="border-b border-slate-200 last:border-0 hover:bg-slate-50 cursor-pointer"
                                                                onClick={() => handleEditClick(driver)}
                                                            >
                                                                <td className="px-4 py-4 text-slate-900 font-medium">{driver.name}</td>
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-slate-900">{driver.email}</span>
                                                                        <span className="text-slate-400 text-xs">{driver.phone || '-'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-slate-900 font-mono text-xs">{driver.license_number}</span>
                                                                        <span className="text-slate-400 text-xs">Exp: {driver.license_expiry || '-'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                        driver.status === 'available' ? 'bg-green-100 text-green-800' :
                                                                        driver.status === 'on_trip' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-slate-100 text-slate-800'
                                                                    }`}>
                                                                        {driver.status.replace('_', ' ')}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEditClick(driver)}
                                                                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </button>
                                                                        {isAdmin && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDelete(driver.id)}
                                                                                disabled={deletingDriverId === driver.id}
                                                                                className="inline-flex items-center justify-center rounded-full border border-red-100 bg-white px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {drivers.map((driver) => (
                                            <div 
                                                key={driver.id} 
                                                onClick={() => handleEditClick(driver)}
                                                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        driver.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                                        driver.status === 'on_trip' ? 'bg-sky-100 text-sky-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                            driver.status === 'available' ? 'bg-emerald-500' :
                                                            driver.status === 'on_trip' ? 'bg-sky-500' :
                                                            'bg-slate-400'
                                                        }`}></span>
                                                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1).replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="mb-4">
                                                    <h3 className="text-lg font-bold text-slate-900">{driver.name}</h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                                        <Mail className="h-3 w-3" />
                                                        {driver.email}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 py-4 border-t border-b border-slate-100 mb-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Phone className="h-4 w-4" />
                                                            <span>Phone</span>
                                                        </div>
                                                        <span className="font-medium text-slate-900">{driver.phone || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>License Exp.</span>
                                                        </div>
                                                        <span className="font-medium text-slate-900">{driver.license_expiry || '-'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => handleEditClick(driver)}
                                                        className="flex-1 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    {isAdmin && (
                                                        <button 
                                                            onClick={() => handleDelete(driver.id)}
                                                            className="inline-flex items-center justify-center rounded-2xl border border-red-100 bg-white px-3 py-2.5 text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Edit Driver Modal */}
            {isEditModalOpen && editingDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Edit Driver Profile</h3>
                                <p className="text-sm text-slate-500">Update information for {editingDriver.name}</p>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDriver} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editFormData.phone || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email (Read-only)</label>
                                <input
                                    type="email"
                                    disabled
                                    value={editingDriver.email}
                                    className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">License Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.license_number || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, license_number: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">License Expiry</label>
                                    <input
                                        type="date"
                                        value={editFormData.license_expiry || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, license_expiry: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition appearance-none"
                                >
                                    <option value="available">Available</option>
                                    <option value="on_trip">On Trip</option>
                                    <option value="off_duty">Off Duty</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="flex-1 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminRoute>
    );
}
