"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useData } from "@/context/DataContext";

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const { session, getSubordinates } = useData();

    const user = session?.user;

    useEffect(() => {
        if (user?.employeeId) {
            getSubordinates(user.employeeId).then(subs => {
                setIsManager(subs.length > 0);
            });
        }
    }, [user, getSubordinates]);

    const userWithRole = {
        ...user,
        isManager
    };

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar
                user={userWithRole}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

