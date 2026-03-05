"use client";

import { useState } from "react";
import { LayoutGrid, Network, Users, Mail, Briefcase, ClipboardList } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrganizationTree } from "./OrganizationTree";
import { DeleteEmployeeButton } from "./DeleteEmployeeButton";
import { Employee } from "@/lib/db";

interface EmployeesViewProps {
    employees: Employee[];
    isAdmin?: boolean;
}

export function EmployeesView({ employees, isAdmin = false }: EmployeesViewProps) {
    const [viewMode, setViewMode] = useState<'GRID' | 'TREE'>('GRID');

    if (employees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 border-dashed text-center min-h-[500px]">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg transition-transform">
                    <Users size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">No staff records found</h2>
                <p className="text-slate-400 max-w-sm font-medium">
                    Your academic roster is currently empty. Start by adding your first educator or staff member.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-wrap bg-slate-100/50 p-1.5 rounded-2xl w-full sm:w-fit gap-1 sm:gap-0">
                <button
                    onClick={() => setViewMode('GRID')}
                    className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                        viewMode === 'GRID' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <LayoutGrid size={18} />
                    Grid View
                </button>
                <button
                    onClick={() => setViewMode('TREE')}
                    className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                        viewMode === 'TREE' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <Network size={18} />
                    Hierarchy Tree
                </button>
            </div>

            {viewMode === 'TREE' ? (
                <OrganizationTree employees={employees} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
                    {employees.map((employee) => (
                        <div key={employee.id} className="group p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-110 transition-transform duration-300 uppercase">
                                    {(employee.firstName?.[0] || "") + (employee.lastName?.[0] || "") || <Users size={20} />}
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        Faculty
                                    </span>
                                    {isAdmin && <DeleteEmployeeButton id={employee.id} />}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {employee.firstName} {employee.lastName}
                                </h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase size={12} className="text-indigo-400" />
                                    {(employee as any).positionName || 'Unknown Position'}
                                </p>
                                {employee.managerId && (
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 flex items-center gap-1.5 bg-indigo-50/50 w-fit px-2 py-1 rounded-lg">
                                        <Users size={10} />
                                        Reports to: {employees.find(e => e.id === employee.managerId)?.firstName} {employees.find(e => e.id === employee.managerId)?.lastName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm">
                                        <Mail size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 truncate">
                                        {employee.email}
                                    </span>
                                </div>

                                <Link
                                    href={`/tasks/manage/${employee.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 font-bold text-sm group/btn"
                                >
                                    <ClipboardList size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    Manage Tasks
                                </Link>

                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Active Status
                                    </div>
                                    <p className="text-[11px] font-black text-slate-300 uppercase">ID: {employee.employeeId}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
