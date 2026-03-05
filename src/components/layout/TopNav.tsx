"use client";

import { Bell, Search, UserCircle, LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { NotificationBell } from "./NotificationBell";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 md:hidden bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="relative w-full md:w-96 max-w-full group hidden sm:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <NotificationBell />

                <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-1 md:gap-2">
                    <button className="flex items-center gap-2 hover:bg-slate-50 p-1.5 md:px-3 rounded-xl transition-colors text-slate-700">
                        <UserCircle size={24} className="text-slate-500" />
                        <span className="text-sm font-semibold hidden md:inline">Profile</span>
                    </button>
                    <button
                        onClick={() => logoutAction()}
                        className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 text-slate-500 p-2 md:p-1.5 rounded-xl transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
