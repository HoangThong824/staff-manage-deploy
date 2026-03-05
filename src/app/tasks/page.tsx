import { getTasks } from "@/actions/task";
import { getEmployees } from "@/actions/employee";
import { getSession } from "@/lib/auth/session";
import { AssignTaskForm } from "@/components/admin/AssignTaskForm";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { UpdateTaskStatusButton } from "@/components/employee/UpdateTaskStatusButton";
import { ClipboardList, Calendar, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TasksPage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const isAdmin = session.user?.role === "ADMIN";
    const employeeId = session.user?.employeeId;

    // Admin sees all tasks, Employee sees only their own
    const tasks = isAdmin
        ? await getTasks()
        : await getTasks({ employeeId: employeeId! });

    const employees = isAdmin ? await getEmployees() : [];

    // For employee managers, get subordinates for AssignTaskForm
    let subordinates: any[] = [];
    if (!isAdmin && employeeId) {
        const db = await import("@/lib/db").then(m => m.db);
        subordinates = await db.employee.getSubordinates(employeeId);
    }

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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {isAdmin ? "Academic Assignments" : "My Tasks"}
                    </h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">
                        {isAdmin
                            ? "Monitor and distribute workload across your faculty team."
                            : "Manage and track your assigned tasks and collaborations."}
                    </p>
                </div>
                <div className="relative z-10">
                    {isAdmin && (
                        <AssignTaskForm employees={employees} adminId={session.user.id} />
                    )}
                    {!isAdmin && subordinates.length > 0 && (
                        <AssignTaskForm employees={subordinates} adminId={session.user.id} />
                    )}
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Task List */}
            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 border-dashed text-center min-h-[500px]">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg transition-transform">
                        <ClipboardList size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">No active assignments</h2>
                    <p className="text-slate-400 max-w-sm font-medium">
                        {isAdmin
                            ? "Your academic task board is clear. Click above to assign new work to your educators."
                            : "You currently have no assigned tasks. Check back later!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="group bg-white rounded-[2rem] shadow-lg shadow-slate-200/20 border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={10} />
                                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Continuous'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {task.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{task.description}</p>

                                        {/* Participants */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <Users size={14} className="text-slate-400" />
                                            <div className="flex flex-wrap gap-2">
                                                {task.participants.map((p: any) => (
                                                    <div key={p.id} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100" title={p.email}>
                                                        <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                                                            {p.name[0]}
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{p.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        {!isAdmin && (
                                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">Update Status</p>
                                                <UpdateTaskStatusButton id={task.id} currentStatus={task.status} />
                                            </div>
                                        )}
                                        <DeleteTaskButton id={task.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
