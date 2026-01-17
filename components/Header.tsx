'use client';

import { Menu, Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    return (
        <header className="bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden mr-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative text-black hidden md:block">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 w-64"
                        />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Bell className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2.5 pl-4 border-l border-slate-200">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 hidden md:inline">
                            {user?.name || 'Guest'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
