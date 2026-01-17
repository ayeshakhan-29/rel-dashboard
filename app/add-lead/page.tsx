'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { createLead } from '../services/leadsService';
import {
    User,
    Building2,
    Mail,
    Phone,
    DollarSign,
    Tag,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Loader2,
} from 'lucide-react';

export default function AddLeadPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'New Leads',
        priority: 'Medium',
        value: '',
        source: 'Website',
    });

    const statusOptions = [
        'New Leads',
        'Contacted',
        'Qualified',
        'Proposal',
        'Second Wing',
        'Closed Won',
        'Closed Lost',
    ];

    const priorityOptions = ['High', 'Medium', 'Low'];

    const sourceOptions = [
        'Website',
        'Referral',
        'Cold Call',
        'LinkedIn',
        'Email Campaign',
        'Trade Show',
        'Other',
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.company.trim()) {
            newErrors.company = 'Company name is required';
        }

        if (formData.value && isNaN(Number(formData.value))) {
            newErrors.value = 'Please enter a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                setLoading(true);
                setApiError(null);

                // Prepare data for API
                const leadData = {
                    name: formData.name,
                    email: formData.email || undefined,
                    phone: formData.phone,
                    company: formData.company || undefined,
                    stage: formData.status,
                    source: formData.source,
                    priority: formData.priority,
                    value: formData.value || undefined,
                };

                // Call API to create lead
                const response = await createLead(leadData);

                if (response.success) {
                    // Show success message
                    setShowSuccess(true);

                    // Reset form
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        status: 'New Leads',
                        priority: 'Medium',
                        value: '',
                        source: 'Website',
                    });

                    // Redirect to leads page after 2 seconds
                    setTimeout(() => {
                        router.push('/leads');
                    }, 2000);
                }
            } catch (error: any) {
                console.error('Error creating lead:', error);
                setApiError(error.response?.data?.message || 'Failed to create lead. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Add New Lead" onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-emerald-800 font-medium">
                                        Lead created successfully!
                                    </p>
                                    <p className="text-xs text-emerald-700 mt-1">
                                        Redirecting to leads page...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {apiError && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                                <p className="text-sm text-red-800 font-medium">
                                    {apiError}
                                </p>
                            </div>
                        )}

                        {/* Form Card */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Lead Information
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Fill in the details to create a new lead
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                                    {/* Name */}
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.name
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-slate-300 bg-white'
                                                    }`}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="flex items-center mt-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                                                <p className="text-xs text-red-600">{errors.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.email
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-slate-300 bg-white'
                                                    }`}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="flex items-center mt-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                                                <p className="text-xs text-red-600">{errors.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.phone
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-slate-300 bg-white'
                                                    }`}
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <div className="flex items-center mt-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                                                <p className="text-xs text-red-600">{errors.phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Company */}
                                    <div>
                                        <label
                                            htmlFor="company"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                id="company"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.company
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-slate-300 bg-white'
                                                    }`}
                                                placeholder="Tech Corp"
                                            />
                                        </div>
                                        {errors.company && (
                                            <div className="flex items-center mt-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                                                <p className="text-xs text-red-600">{errors.company}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label
                                            htmlFor="status"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-all"
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label
                                            htmlFor="priority"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Priority
                                        </label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-all"
                                        >
                                            {priorityOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Deal Value */}
                                    <div>
                                        <label
                                            htmlFor="value"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Deal Value (USD)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                id="value"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.value
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-slate-300 bg-white'
                                                    }`}
                                                placeholder="5000"
                                            />
                                        </div>
                                        {errors.value && (
                                            <div className="flex items-center mt-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                                                <p className="text-xs text-red-600">{errors.value}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <label
                                            htmlFor="source"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Lead Source
                                        </label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                            <select
                                                id="source"
                                                name="source"
                                                value={formData.source}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all appearance-none"
                                            >
                                                {sourceOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        disabled={loading}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Lead'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
