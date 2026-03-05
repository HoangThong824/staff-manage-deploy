"use client";

import { HistoryEntry } from "@/lib/db";
import {
    Clock,
    User,
    Shield,
    Briefcase,
    ClipboardList,
    Activity,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HistoryTableProps {
    history: HistoryEntry[];
}

export function HistoryTable({ history }: HistoryTableProps) {
    const getTypeStyles = (type: HistoryEntry['type']) => {
        switch (type) {
            case 'EMPLOYEE':
                return {
                    icon: Briefcase,
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-600',
                    border: 'border-emerald-100'
                };
            case 'TASK':
                return {
                    icon: ClipboardList,
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-600',
                    border: 'border-indigo-100'
                };
            case 'AUTH':
                return {
                    icon: Shield,
                    bg: 'bg-amber-50',
                    text: 'text-amber-600',
                    border: 'border-amber-100'
                };
            default:
                return {
                    icon: Activity,
                    bg: 'bg-slate-50',
                    text: 'text-slate-600',
                    border: 'border-slate-100'
                };
        }
    };

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 border-dashed text-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                    <Activity size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">No activity recorded</h2>
                <p className="text-slate-400 font-medium">The system is ready. All future actions will be logged here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/50">Activity</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/50">User</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/50">Details</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/50">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {history.map((entry) => {
                            const styles = getTypeStyles(entry.type);
                            const Icon = styles.icon;

                            return (
                                <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                                                styles.bg, styles.text, styles.border
                                            )}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="font-bold text-slate-900">{entry.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                                                {entry.userName[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600">{entry.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-slate-400 font-medium max-w-md line-clamp-2 italic">
                                            "{entry.details}"
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} className="text-slate-300" />
                                            <span className="text-xs font-bold tracking-tight">
                                                {format(new Date(entry.createdAt), "HH:mm · MMM d, yyyy")}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
