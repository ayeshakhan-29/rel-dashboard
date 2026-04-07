'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AdminRoute from '@/app/components/auth/AdminRoute';
import { createUser } from '@/app/services/userService';
import { UserPlus, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function RegisterTeamMemberPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'team' as const
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        if (!formData.name.trim()) validationErrors.name = 'Name is required';
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
            await createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            setSuccess(true);

            setTimeout(() => {
                router.push('/admin/team');
            }, 1600);
        } catch (error: any) {
            console.error('Team member registration error:', error);
            setApiError(error.response?.data?.message || 'Failed to register team member.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Register Team Member" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-3xl mx-auto">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/team')}
                                className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Team Management
                            </button>

                            {success && (
                                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        <div>
                                            <p className="font-semibold text-emerald-900">Team member registered successfully.</p>
                                            <p className="text-sm text-emerald-700">You will be redirected shortly.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {apiError && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <p className="text-sm text-red-700">{apiError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">Register Team Member</h1>
                                        <p className="text-sm text-slate-500">
                                            Add a new staff member to the platform.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                                                placeholder="Enter full name"
                                            />
                                            {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                                                placeholder="staff@example.com"
                                            />
                                            {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Assigned Role
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                value="Team"
                                                className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-500 border-slate-200 bg-slate-100 cursor-not-allowed"
                                            />
                                            <p className="mt-1 text-xs text-slate-500">This role is automatically assigned for new staff members.</p>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                                                    placeholder="Create password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="mt-2 text-xs text-red-600">{errors.password}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                                                    placeholder="Repeat password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/admin/team')}
                                            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || success}
                                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="mr-2 h-4 w-4" />
                                            )}
                                            Register Staff Member
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
