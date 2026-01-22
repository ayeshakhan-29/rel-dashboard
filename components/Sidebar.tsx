'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
    Home,
    Users,
    BarChart3,
    Settings,
    CheckSquare,
    Layers,
    X,
    UserPlus,
    Plus,
    Calendar,
    Mail,
    FileText,
    Phone,
    MessageSquare,
    Users as UsersIcon,
    Video,
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    divider?: boolean;
}

const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Pipeline', href: '/pipeline', icon: Layers },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Add Lead', href: '/add-lead', icon: UserPlus },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Add Task', href: '/create-task', icon: Plus },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Emails', href: '/emails', icon: Mail },
    { name: 'Forms', href: '/forms', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    
    // RingCentral Integration
    { name: 'RingCentral', href: '/dashboard/ringcentral', icon: Phone, divider: true },
    { name: 'Calls', href: '/calls', icon: Phone },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Team Chat', href: '/teams', icon: UsersIcon },
    { name: 'Meetings', href: '/meetings', icon: Video },
    
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-600">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold text-slate-900">{user?.name || 'Lead CRM'}</h1>
                        <span className="text-xs text-slate-500">{user?.email || 'Welcome'}</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            <nav className="mt-6 px-3">
                <div className="space-y-1">
                    {navigationItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <div key={item.name}>
                                {item.divider && index > 0 && (
                                    <div className="my-2 border-t border-slate-200"></div>
                                )}
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${active
                                        ? 'text-white bg-slate-900'
                                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                        }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 mr-3 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-600'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
