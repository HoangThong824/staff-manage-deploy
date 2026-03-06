"use client";

import { useEffect, useState } from "react";
import { AddDepartmentForm } from "@/components/admin/AddDepartmentForm";
import { DepartmentsView } from "@/components/admin/DepartmentsView";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function DepartmentsPage() {
    const { data, getDepartments, session, loading } = useData();
    const [departments, setDepartments] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!session || session.user.role !== "ADMIN")) {
            router.push("/");
        }
    }, [session, loading, router]);

    useEffect(() => {
        getDepartments().then(setDepartments);
    }, [getDepartments, data.departments]);

    if (loading || !session) return <div className="p-10 text-center font-bold">Loading Departments...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Departments</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Manage and organize the institutional structure of your faculties.</p>
                </div>
                <div className="relative z-10">
                    <AddDepartmentForm />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <DepartmentsView departments={departments} />
        </div>
    );
}

