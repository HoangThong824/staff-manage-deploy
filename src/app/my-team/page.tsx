"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { EmployeesView } from "@/components/admin/EmployeesView";
import { useData } from "@/context/DataContext";
import { Employee } from "@/lib/db";

export default function MyTeamPage() {
    const { getSubordinates, session, loading } = useData();
    const [subordinates, setSubordinates] = useState<Employee[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!session || !session.user.employeeId) {
                router.push("/login");
            }
        }
    }, [session, loading, router]);

    useEffect(() => {
        if (session?.user.employeeId) {
            getSubordinates(session.user.employeeId).then(setSubordinates);
        }
    }, [session, getSubordinates]);

    if (loading || !session) return <div className="p-10 text-center font-bold">Loading Team...</div>;

    if (subordinates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 border-dashed text-center min-h-[500px]">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg group-hover:scale-110 transition-transform">
                    <Users size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">No team members assigned</h2>
                <p className="text-slate-400 max-w-sm font-medium">
                    You currently don't have any subordinates assigned to you in the faculty hierarchy.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Academic Team</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Manage and support your direct and indirect reports.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <EmployeesView employees={subordinates as any} isAdmin={false} />
        </div>
    );
}

