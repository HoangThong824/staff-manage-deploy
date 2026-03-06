"use client";

import { useEffect, useState } from "react";
import { AddPositionForm } from "@/components/admin/AddPositionForm";
import { PositionsView } from "@/components/admin/PositionsView";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function PositionsPage() {
    const { data, getPositions, getDepartments, session, loading } = useData();
    const [positions, setPositions] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!session || session.user.role !== "ADMIN")) {
            router.push("/");
        }
    }, [session, loading, router]);

    useEffect(() => {
        getPositions().then(setPositions);
        getDepartments().then(setDepartments);
    }, [getPositions, getDepartments, data.positions, data.departments]);

    if (loading || !session) return <div className="p-10 text-center font-bold">Loading Roles...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Institutional Roles</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Define and oversee the various academic positions across your departments.</p>
                </div>
                <div className="relative z-10">
                    <AddPositionForm departments={departments} />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <PositionsView positions={positions} />
        </div>
    );
}

