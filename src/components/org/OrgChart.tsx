"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Users, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Department, Employee, Position } from "@/lib/db";

type EmployeeView = Employee & {
    positionTitle?: string;
    departmentName?: string;
};

interface OrgChartProps {
    employees: Employee[];
    positions: Position[];
    departments: Department[];
}

function buildEmployeeView(
    employees: Employee[],
    positions: Position[],
    departments: Department[]
): EmployeeView[] {
    return employees.map((e) => {
        const pos = positions.find((p) => p.id === e.positionId);
        const dept = departments.find((d) => d.id === e.departmentId);
        return {
            ...e,
            positionTitle: pos?.title,
            departmentName: dept?.name,
        };
    });
}

export function OrgChart({ employees, positions, departments }: OrgChartProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const employeeViews = useMemo(
        () => buildEmployeeView(employees, positions, departments),
        [employees, positions, departments]
    );

    const byManager = useMemo(() => {
        const map = new Map<string | null, EmployeeView[]>();
        for (const e of employeeViews) {
            const key = e.managerId ?? null;
            const arr = map.get(key) || [];
            arr.push(e);
            map.set(key, arr);
        }
        // stable order for UI
        for (const [k, arr] of map.entries()) {
            arr.sort((a, b) => {
                const an = `${a.lastName} ${a.firstName}`.toLowerCase();
                const bn = `${b.lastName} ${b.firstName}`.toLowerCase();
                return an.localeCompare(bn);
            });
            map.set(k, arr);
        }
        return map;
    }, [employeeViews]);

    const roots = byManager.get(null) || [];

    const toggle = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const renderNode = (e: EmployeeView, depth: number) => {
        const children = byManager.get(e.id) || [];
        const isOpen = expanded.has(e.id);
        const hasChildren = children.length > 0;

        return (
            <div key={e.id} className="space-y-2">
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-all",
                        depth === 0 ? "border-indigo-100" : "border-slate-100"
                    )}
                    style={{ marginLeft: depth * 18 }}
                >
                    <button
                        type="button"
                        onClick={() => hasChildren && toggle(e.id)}
                        className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors border",
                            hasChildren
                                ? "bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-600 hover:text-indigo-700"
                                : "bg-slate-50 border-slate-200 text-slate-300 cursor-default"
                        )}
                        aria-label={hasChildren ? "Toggle team" : "No team"}
                        disabled={!hasChildren}
                    >
                        {hasChildren ? (
                            isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        ) : (
                            <Users size={16} />
                        )}
                    </button>

                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md uppercase overflow-hidden">
                        {e.firstName?.[0]}
                        {e.lastName?.[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-900 truncate">
                                {e.firstName} {e.lastName}
                            </p>
                            {hasChildren && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    Manager
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-slate-500 truncate">
                            {e.positionTitle || "Unknown position"}
                            {e.departmentName ? ` • ${e.departmentName}` : ""}
                        </p>
                    </div>

                    {hasChildren && (
                        <div className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-xl">
                            {children.length} report{children.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {hasChildren && isOpen && (
                    <div className="space-y-2">
                        {children.map((c) => renderNode(c, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (employees.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-lg shadow-slate-100/50">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                    <Network size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No employees found</h3>
                <p className="text-slate-400 font-medium">Add employees to visualize the organization chart.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {roots.map((r) => renderNode(r, 0))}
        </div>
    );
}

