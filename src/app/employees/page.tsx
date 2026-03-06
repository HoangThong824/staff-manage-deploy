"use client";

import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { AddEmployeeForm } from "@/components/admin/AddEmployeeForm";
import { EmployeesView } from "@/components/admin/EmployeesView";

export default function EmployeesPage() {
    const { data, getEmployees, loading } = useData();
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        getEmployees().then(setEmployees);
    }, [getEmployees, data.employees]); // Refresh when data.employees changes

    if (loading) return <div className="p-10 text-center font-bold">Loading Faculty...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
                <div className="relative">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Manage and view all faculty members across the institution.</p>
                </div>
                <div className="relative">
                    <AddEmployeeForm
                        employees={data.employees}
                        departments={data.departments}
                        positions={data.positions}
                    />
                </div>
            </div>

            <EmployeesView employees={employees as any} isAdmin={true} />
        </div>
    );
}
