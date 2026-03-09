"use client";

import { useState } from "react";
import { Plus, X, UserPlus, Fingerprint } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Employee } from "@/lib/db";
import { cn } from "@/lib/utils";

interface TaskParticipantsManagerProps {
    task: {
        id: string;
        participants: { id: string, name: string, email: string }[];
    };
    allEmployees: Employee[];
}

export function TaskParticipantsManager({ task, allEmployees }: TaskParticipantsManagerProps) {
    const { addMemberToTask, removeMemberFromTask, createHistory, session } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAdd = async (empId: string) => {
        setLoadingId(empId);
        try {
            await addMemberToTask(task.id, empId);
            const emp = allEmployees.find(e => e.id === empId);
            if (session && emp) {
                await createHistory({
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    type: "TASK",
                    action: "ADD_MEMBER",
                    details: `Added ${emp.firstName} ${emp.lastName} to task`,
                    targetId: task.id
                });
            }
        } catch (err: any) {
            alert(err.message || "Failed to add member");
        }
        setLoadingId(null);
        setIsAdding(false);
    };

    const handleRemove = async (empId: string) => {
        if (!confirm("Remove this member from the task?")) return;
        setLoadingId(empId);
        try {
            const member = task.participants?.find(p => p.id === empId);
            await removeMemberFromTask(task.id, empId);
            if (session && member) {
                await createHistory({
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    type: "TASK",
                    action: "REMOVE_MEMBER",
                    details: `Removed ${member.name} from task`,
                    targetId: task.id
                });
            }
        } catch (err: any) {
            alert(err.message || "Failed to remove member");
        }
        setLoadingId(null);
    };

    const availableEmployees = allEmployees.filter(
        emp => !task.participants?.some(p => p.id === emp.id)
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                {task.participants?.map((p) => (
                    <div
                        key={p.id}
                        className="group/member flex items-center gap-2.5 pl-3 pr-2 py-2 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-300"
                    >
                        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm">
                            {p.name[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-700 truncate">{p.name}</span>
                        </div>
                        <button
                            onClick={() => handleRemove(p.id)}
                            disabled={loadingId === p.id}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-white rounded-md transition-all opacity-0 group-hover/member:opacity-100"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 font-bold text-[10px] uppercase tracking-wider"
                    >
                        <UserPlus size={14} />
                        Add Partner
                    </button>
                ) : (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                        <select
                            onChange={(e) => e.target.value && handleAdd(e.target.value)}
                            disabled={loadingId !== null}
                            className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            defaultValue=""
                        >
                            <option value="">Choose Faculty...</option>
                            {availableEmployees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

