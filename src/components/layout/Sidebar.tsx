"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    LayoutDashboard,
    Building2,
    Briefcase,
    Clock,
    CalendarCheck,
    Settings,
    ChevronLeft,
    Menu,
    BookOpen,
    Network,
    Activity,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const adminMenuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: ClipboardList },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Departments", href: "/departments", icon: Building2 },
    { name: "Positions", href: "/positions", icon: Briefcase },
    { name: "Attendance", href: "/attendance", icon: Clock },
    { name: "Leave Requests", href: "/leave", icon: CalendarCheck },
    { name: "Activity History", href: "/history", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
];

const employeeMenuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Settings", href: "/settings", icon: Settings },
];

const managerMenuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Team", href: "/my-team", icon: Network },
    { name: "Settings", href: "/settings", icon: Settings },
];


export function Sidebar({
    user,
    isOpen,
    onClose
}: {
    user?: { name: string, email: string, role: string, employeeId?: string | null },
    isOpen?: boolean,
    onClose?: () => void
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = user?.role === "ADMIN"
        ? adminMenuItems
        : ((user as any)?.isManager ? managerMenuItems : employeeMenuItems);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r bg-white flex flex-col justify-between",
                    isCollapsed ? "w-20" : "w-64",
                    // Mobile visibility
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between h-20 px-4 shrink-0">
                        {!isCollapsed ? (
                            <div className="flex items-center gap-2.5 px-2">
                                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    Manage
                                </span>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-200">
                                <BookOpen size={20} />
                            </div>
                        )}

                        {/* Mobile Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 md:hidden text-slate-400 hover:text-slate-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    {/* Navigation Section */}
                    <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-3 rounded-xl transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50/50"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon size={20} className={cn("min-w-[20px] transition-transform duration-300 group-hover:scale-110", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                                    {!isCollapsed && <span className="ml-3 font-medium text-sm truncate">{item.name}</span>}

                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-in fade-in" />
                                    )}

                                    {isCollapsed && (
                                        <div className="absolute left-16 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer info */}
                {!isCollapsed && user && (
                    <div className="p-4 mx-3 mb-4 rounded-2xl bg-slate-50/80 border border-slate-100 transition-all hover:bg-slate-100/80">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200">
                                {user.name?.[0] || user.email?.[0]?.toUpperCase() || <Users size={16} />}
                            </div>
                            <div className="ml-3 overflow-hidden flex-1">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user.name || "User"}</p>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{user.role}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full hidden md:flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all z-50"
                >
                    {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
                </button>
            </aside>
        </>
    );
}
