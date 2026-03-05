import { getTasks } from "@/actions/task";
import { getEmployees } from "@/actions/employee";
import { getSession } from "@/lib/auth/session";
import { AssignTaskForm } from "@/components/admin/AssignTaskForm";
import { ClipboardList, Calendar, User as UserIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";

export default async function AdminTasksPage() {
    const session = await getSession();
    if (!session || session.user?.role !== "ADMIN") {
        redirect("/");
    }

    const tasks = await getTasks();
    const employees = await getEmployees();

    const getStatusColor = (status: string) => {
        if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-amber-50 text-amber-700 border-amber-200';
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Assignments</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Monitor and distribute workload across your faculty team.</p>
                </div>
                <div className="relative z-10">
                    <AssignTaskForm employees={employees} adminId={session.user.id} />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* List / Empty State */}
            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 border-dashed text-center min-h-[500px]">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg transition-transform">
                        <ClipboardList size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">No active assignments</h2>
                    <p className="text-slate-400 max-w-sm font-medium">
                        Your academic task board is clear. Click above to assign new work to your educators.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 overflow-hidden">
                    <div className="overflow-x-auto px-4 py-2">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-slate-400">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-1/3">Assignment Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Faculty Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Expected Completion</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Current Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-6 py-6 border-l-4 border-transparent group-hover:border-indigo-500 rounded-l-2xl">
                                            <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                            <p className="text-sm text-slate-400 mt-1 font-medium line-clamp-1">{task.description}</p>
                                        </td>
                                        <td className="px-6 py-6 font-semibold text-slate-700">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                                                    {task.employeeName[0]}
                                                </div>
                                                {task.employeeName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center text-sm font-bold text-slate-500 gap-2">
                                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                    <Calendar size={14} />
                                                </div>
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Continuous'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right rounded-r-2xl">
                                            <DeleteTaskButton id={task.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
