"use client";

import { Bell, Check, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useData } from "@/context/DataContext";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
    const { session, data, getNotifications, markNotificationRead, markNotificationsRead } = useData();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        if (!session?.user?.id) return;
        const results = await getNotifications({ userId: session.user.id });
        setNotifications(results);
    };

    // Update locally when data.notifications changes in this tab
    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications();
        }
    }, [data.notifications, session?.user?.id]);

    // Poll for changes from other tabs
    useEffect(() => {
        if (!session?.user?.id) return;

        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [session?.user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markNotificationRead(id);
        fetchNotifications();
    };

    const handleMarkAllAsRead = async () => {
        if (!session?.user?.id) return;
        await markNotificationsRead(session.user.id);
        fetchNotifications();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-default ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex justify-between gap-3">
                                            <p className={`text-sm ${!n.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                {n.message}
                                            </p>
                                            {!n.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(n.id, e)}
                                                    className="shrink-0 text-blue-600 hover:bg-blue-100 p-1 rounded-full transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
