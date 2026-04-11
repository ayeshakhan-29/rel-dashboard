'use client';

import { Menu, Bell, Search, User } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/app/context/AuthContext';

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden mr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative text-black hidden md:block">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-800 dark:text-slate-200 w-64 transition-colors"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                    <div className="flex items-center space-x-2.5 pl-4 border-l border-slate-200 dark:border-slate-700">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
                            {user?.name || 'Guest'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
