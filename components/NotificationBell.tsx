'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Calendar, Car, Info } from 'lucide-react';
import * as notificationsService from '@/app/services/notificationsService';
import { Notification } from '@/app/services/notificationsService';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsService.getNotifications(10);
            setNotifications(response.data || []);
            setUnreadCount(response.unread || 0);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationsService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Update unread count if deleted notification was unread
            const deletedNotif = notifications.find(n => n.id === id);
            if (deletedNotif && !deletedNotif.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'trip_assigned': return <Car className="h-4 w-4 text-emerald-500" />;
            case 'trip_cancelled': return <X className="h-4 w-4 text-rose-500" />;
            case 'reminder': return <Calendar className="h-4 w-4 text-blue-500" />;
            default: return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition active:scale-95 shadow-sm"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900/30">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Notifications</h3>
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-0.5">{unreadCount} New Alerts</p>
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-black tracking-widest uppercase bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto bg-slate-50/30 dark:bg-slate-900/50">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 dark:text-slate-600 shadow-sm">
                                    <Bell className="h-8 w-8" />
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id}
                                        className={clsx(
                                            "p-5 transition-colors group relative",
                                            notification.is_read ? "bg-transparent opacity-70" : "bg-white dark:bg-slate-900"
                                        )}
                                    >
                                        <div className="flex gap-4">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border",
                                                notification.is_read ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                            )}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-12">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{notification.title}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug font-medium line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Row Actions */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.is_read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition shadow-sm border border-emerald-100"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(notification.id)}
                                                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition shadow-sm border border-rose-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {!notification.is_read && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-lg shadow-emerald-500/20"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-black text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition tracking-widest uppercase italic"
                        >
                            Close Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
