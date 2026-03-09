"use client";

import Link from "next/link";
import { ClipboardList, Calendar, Users, ExternalLink } from "lucide-react";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { UpdateTaskStatusButton } from "@/components/employee/UpdateTaskStatusButton";

import { useData } from "@/context/DataContext";
import type { Task } from "@/lib/db";

type TaskWithParticipants = Task & {
    participants: { id: string; name: string; email: string }[];
};

interface TaskListViewProps {
    tasks: TaskWithParticipants[];
    isAdmin: boolean;
    currentUserId?: string;
}

function getStatusColor(status: string) {
    if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "IN_PROGRESS") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
}

export function TaskListView({ tasks, isAdmin, currentUserId }: TaskListViewProps) {
    const { session, data } = useData();
    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="group bg-white rounded-[2rem] shadow-lg shadow-slate-200/20 border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
                >
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span
                                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}
                                    >
                                        {task.status.replace("_", " ")}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={10} />
                                        Due:{" "}
                                        {task.dueDate
                                            ? new Date(task.dueDate).toLocaleDateString()
                                            : "Continuous"}
                                    </span>
                                </div>
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="flex items-center gap-2 text-xl font-black text-slate-900 hover:text-indigo-600 transition-colors group/link"
                                >
                                    {task.title}
                                    <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-60 flex-shrink-0" />
                                </Link>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {task.description}
                                </p>

                                <div className="flex items-center gap-3 pt-2">
                                    <Users size={14} className="text-slate-400" />
                                    <div className="flex flex-wrap gap-2">
                                        {task.participants?.map((p: { id: string; name: string; email: string }) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
                                                title={p.email}
                                            >
                                                <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                                                    {p.name[0]}
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                                                    {p.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                {(() => {
                                    const isAssigner = !!currentUserId && task.assignedBy === currentUserId;
                                    const isParticipant = !!currentUserId && task.employeeIds.includes(data.employees.find(e => e.email === session?.user?.email)?.id || "");
                                    const canViewStatus = isAdmin || isAssigner || isParticipant;

                                    return canViewStatus && (
                                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">
                                                Update Status
                                            </p>
                                            <UpdateTaskStatusButton
                                                id={task.id}
                                                currentStatus={task.status}
                                                canComplete={isAdmin || isAssigner || isParticipant}
                                            />
                                        </div>
                                    );
                                })()}
                                <DeleteTaskButton
                                    id={task.id}
                                    canDelete={isAdmin || (!!currentUserId && task.assignedBy === currentUserId)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TaskListEmpty({ isAdmin }: { isAdmin: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 border-dashed text-center min-h-[500px]">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg transition-transform">
                <ClipboardList size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">
                No active assignments
            </h2>
            <p className="text-slate-400 max-w-sm font-medium">
                {isAdmin
                    ? "Your academic task board is clear. Click above to assign new work to your educators."
                    : "You currently have no assigned tasks. Check back later!"}
            </p>
        </div>
    );
}
