'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import authService from '../services/authService';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await authService.forgotPassword(email.trim());
            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl shadow-xl border border-border transition-colors">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {submitted ? (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 p-6 border border-emerald-200 dark:border-emerald-900/30 text-center space-y-3">
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                            If that email exists in our system, a reset link has been sent.
                        </p>
                        <p className="text-xs text-slate-500">Check your inbox and follow the link to reset your password.</p>
                        <Link href="/login" className="inline-block mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                            Back to login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-900/30">
                                <p className="text-sm font-bold text-red-800 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-foreground mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                className="appearance-none relative block w-full px-3 py-2.5 border border-border bg-background placeholder-slate-400 text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                placeholder="john@example.com"
                            />
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
                                    Sending...
                                </span>
                            ) : 'Send Reset Link'}
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
