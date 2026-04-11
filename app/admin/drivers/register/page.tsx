'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAuth } from '@/app/context/AuthContext';
import AdminRoute from '@/app/components/auth/AdminRoute';
import { registerDriver } from '@/app/services/driversService';
import { UserPlus, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useEffect } from 'react';

export default function RegisterDriverPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, router]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        licenseNumber: '',
        licenseExpiry: '',
        vehicleId: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const validationErrors: Record<string, string> = {};

        if (!formData.name.trim()) validationErrors.name = 'Driver name is required';
        if (!formData.email.trim()) {
            validationErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) validationErrors.password = 'Password is required';
        if (!formData.confirmPassword) validationErrors.confirmPassword = 'Please confirm the password';
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.licenseNumber.trim()) validationErrors.licenseNumber = 'License number is required';

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);
            await registerDriver(formData);
            setSuccess(true);

            setTimeout(() => {
                router.push('/admin/drivers');
            }, 1600);
        } catch (error: any) {
            console.error('Driver registration error:', error);
            setApiError(error.response?.data?.message || 'Failed to register driver.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminRoute>
            <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Register Driver" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 transition-colors duration-300">
                        <div className="max-w-3xl mx-auto">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/drivers')}
                                className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to drivers
                            </button>

                            {success && (
                                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top duration-300">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        <div>
                                            <p className="font-semibold text-emerald-900 dark:text-emerald-400">Driver registered successfully.</p>
                                            <p className="text-sm text-emerald-700 dark:text-emerald-500/80">You will be redirected to the Drivers page shortly.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {apiError && (
                                <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top duration-300">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 md:p-8 transition-colors duration-300">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-foreground">Register Driver</h1>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Add a new driver profile for dispatch and trip assignments.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.name ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-border'}`}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.email ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-border'}`}
                                                placeholder="driver@example.com"
                                            />
                                            {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                Phone Number
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="vehicleId" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                Vehicle ID <small className="opacity-60">(optional)</small>
                                            </label>
                                            <input
                                                id="vehicleId"
                                                name="vehicleId"
                                                value={formData.vehicleId}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                placeholder="e.g. VH-102"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="licenseNumber" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                License Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="licenseNumber"
                                                name="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm text-foreground bg-background font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.licenseNumber ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-border'}`}
                                                placeholder="DL-000000"
                                            />
                                            {errors.licenseNumber && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1">{errors.licenseNumber}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="licenseExpiry" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                License Expiry
                                            </label>
                                            <input
                                                id="licenseExpiry"
                                                name="licenseExpiry"
                                                type="date"
                                                value={formData.licenseExpiry}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all color-scheme-light dark:color-scheme-dark"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="password" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${errors.password ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-border'}`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.confirmPassword ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-border'}`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/admin/drivers')}
                                            className="rounded-2xl border border-border bg-background px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || success}
                                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 dark:bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95 shadow-lg shadow-emerald-500/10"
                                        >
                                            {loading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="mr-2 h-4 w-4" />
                                            )}
                                            Register Driver
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}
