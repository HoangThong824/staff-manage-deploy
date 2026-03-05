"use client";

import { Employee } from "@/lib/db";
import { ChevronRight, ChevronDown, User, Briefcase } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
    employee: Employee;
    allEmployees: Employee[];
    level: number;
}

function TreeNode({ employee, allEmployees, level }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const subordinates = allEmployees.filter((e) => e.managerId === employee.id);
    const hasSubordinates = subordinates.length > 0;

    return (
        <div className="ml-2 md:ml-8">
            <div
                className={cn(
                    "group relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all duration-300 mb-4 bg-white",
                    level === 0 ? "border-indigo-100 shadow-lg shadow-indigo-100/50" : "border-slate-100 shadow-sm hover:shadow-md",
                    "hover:border-indigo-200"
                )}
            >
                {/* Connector Line */}
                {level > 0 && (
                    <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-200" />
                )}

                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-110 transition-transform duration-300 uppercase">
                    {(employee.firstName?.[0] || "") + (employee.lastName?.[0] || "") || <User size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {employee.firstName} {employee.lastName}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Briefcase size={10} className="text-indigo-400" />
                        {(employee as any).positionName || "Educator"}
                    </p>
                </div>

                {hasSubordinates && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                )}
            </div>

            {hasSubordinates && isExpanded && (
                <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 pl-1 md:pl-2">
                    {subordinates.map((sub) => (
                        <TreeNode
                            key={sub.id}
                            employee={sub}
                            allEmployees={allEmployees}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function OrganizationTree({ employees }: { employees: Employee[] }) {
    // Find top-level managers (those without a managerId or whose managerId is not in the list)
    const topLevelEmployees = employees.filter(
        (e) => !e.managerId || !employees.some((m) => m.id === e.managerId)
    );

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 min-h-[500px]">
            <div className="max-w-4xl mx-auto py-10">
                {topLevelEmployees.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-medium italic">No reporting structure defined yet.</p>
                    </div>
                ) : (
                    topLevelEmployees.map((emp) => (
                        <div key={emp.id} className="mb-10 last:mb-0">
                            <TreeNode
                                employee={emp}
                                allEmployees={employees}
                                level={0}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
