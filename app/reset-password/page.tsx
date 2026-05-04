'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import authService from '../services/authService';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid reset token');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword(token, password);
            setSuccess(true);
        } catch {
            setError('Invalid or expired reset token. Please request a new one.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl shadow-xl border border-border transition-colors text-center">
                    <div className="text-6xl">✅</div>
                    <h2 className="text-2xl font-extrabold text-foreground">Password Reset!</h2>
                    <p className="text-sm text-slate-500">
                        Your password has been reset successfully.
                    </p>
                    <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl shadow-xl border border-border transition-colors">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Reset your password
                    </h2>
                </div>

                {error && !token && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-900/30 text-center space-y-3">
                        <p className="text-sm font-bold text-red-800 dark:text-red-400">{error}</p>
                        <Link href="/forgot-password" className="inline-block text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                            Request a new reset link
                        </Link>
                    </div>
                )}

                {token && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-900/30">
                                <p className="text-sm font-bold text-red-800 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-foreground mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    className="appearance-none relative block w-full px-3 py-2.5 border border-border bg-background placeholder-slate-400 text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-foreground mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    className="appearance-none relative block w-full px-3 py-2.5 border border-border bg-background placeholder-slate-400 text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-foreground"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting...
                                </span>
                            ) : 'Reset Password'}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl shadow-xl border border-border text-center">
                    <div className="text-6xl">⏳</div>
                    <h2 className="text-2xl font-extrabold text-foreground">Loading...</h2>
                    <p className="text-sm text-slate-500">Preparing reset password form</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}