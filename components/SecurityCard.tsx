'use client';

import { useState } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { updateProfile } from '@/app/services/userService';
import { validateEmail, validatePassword, validatePasswordMatch, validateRequired } from '@/lib/validation';

export default function SecurityCard() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        const nameError = validateRequired(formData.name, 'Name');
        if (nameError) newErrors.name = nameError;

        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required to change password';
            }

            const passwordError = validatePassword(formData.newPassword);
            if (passwordError) newErrors.newPassword = passwordError;

            const matchError = validatePasswordMatch(formData.newPassword, formData.confirmPassword);
            if (matchError) newErrors.confirmPassword = matchError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const updateData = {
                name: formData.name,
                email: formData.email,
                ...(formData.newPassword && {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            };

            const response = await updateProfile(updateData);

            if (response.success) {
                // Update user in auth context
                updateUser(response.user);

                setSuccess('Profile updated successfully!');
                setIsEditing(false);

                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setErrors({});
        setError(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-border p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground">Security Settings</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security and personal information</p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm font-bold text-foreground border border-border hover:bg-background rounded-xl transition-all"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{success}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-3 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">{error}</span>
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-foreground focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-border bg-background'
                                    }`}
                                placeholder="Enter your full name"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
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
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-foreground focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-border bg-background'
                                    }`}
                                placeholder="Enter your email address"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-bold text-foreground mb-3">Change Password (Optional)</h4>

                        {/* Current Password */}
                        <div className="mb-4">
                            <label htmlFor="currentPassword" className="block text-sm font-bold text-foreground mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-2.5 border rounded-xl text-foreground focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.currentPassword ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-border bg-background'
                                        }`}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-foreground"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{errors.currentPassword}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-bold text-foreground mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-2.5 border rounded-xl text-foreground focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.newPassword ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-border bg-background'
                                        }`}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-foreground"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{errors.newPassword}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-foreground mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-foreground focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.confirmPassword ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-border bg-background'
                                        }`}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border mt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-foreground bg-background border border-border rounded-xl hover:bg-card transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center shadow-md active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Profile'
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-sm font-bold text-foreground">{user?.name}</p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Full Name</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-sm font-bold text-foreground">{user?.email}</p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Email Address</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-sm font-bold text-foreground">••••••••</p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Password</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}