import { getTask, getTaskItems } from "@/actions/task";
import { getEmployees } from "@/actions/employee";
import { getSession } from "@/lib/auth/session";
import { readDb } from "@/lib/db";
import { EditTaskForm } from "@/components/admin/EditTaskForm";
import { TaskItemBoard } from "@/components/tasks/TaskItemBoard";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { TaskParticipantsManager } from "@/components/admin/TaskParticipantsManager";
import { UpdateTaskStatusButton } from "@/components/employee/UpdateTaskStatusButton";
import {
    ArrowLeft,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ taskId: string }>;
}) {
    const { taskId } = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    const task = await getTask(taskId);
    if (!task) notFound();

    const data = readDb();
    const currentUser = data.users.find((u) => u.id === session.user.id);

    let hasPermission = false;
    let canEditDetails = false;
    if (currentUser?.role === "ADMIN") {
        hasPermission = true;
        canEditDetails = true;
    } else if (task.assignedBy === session.user.id) {
        hasPermission = true;
        canEditDetails = true;
    } else if (task.employeeIds.includes(currentUser?.employeeId || "")) {
        hasPermission = true;
        canEditDetails = false;
    } else if (currentUser?.employeeId) {
        const dbHelper = await import("@/lib/db").then((m) => m.db);
        for (const empId of task.employeeIds) {
            const isSub = await dbHelper.employee.isSubordinate(
                currentUser.employeeId,
                empId
            );
            if (isSub) {
                hasPermission = true;
                canEditDetails = true;
                break;
            }
        }
    }

    if (!hasPermission) redirect("/tasks");

    const taskItems = await getTaskItems(taskId);

    let assignableEmployees = data.employees;
    if (currentUser?.role !== "ADMIN" && currentUser?.employeeId) {
        const subs = await (
            await import("@/lib/db")
        ).db.employee.getSubordinates(currentUser.employeeId);
        assignableEmployees = subs as typeof data.employees;
    }

    const getStatusStyles = (status: string) => {
        if (status === "COMPLETED")
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (status === "IN_PROGRESS")
            return "bg-blue-50 text-blue-700 border-blue-200";
        return "bg-amber-50 text-amber-700 border-amber-200";
    };

    const getStatusIcon = (status: string) => {
        if (status === "COMPLETED")
            return <CheckCircle2 size={18} className="text-emerald-500" />;
        if (status === "IN_PROGRESS")
            return <Clock size={18} className="text-blue-500" />;
        return <AlertCircle size={18} className="text-amber-500" />;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
                <Link
                    href="/tasks"
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors group"
                >
                    <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    Back to Tasks
                </Link>
            </nav>

            {/* Task Header */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
                <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tighter border",
                                        getStatusStyles(task.status)
                                    )}
                                >
                                    {getStatusIcon(task.status)}
                                    {task.status.replace("_", " ")}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    Due:{" "}
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString(
                                              "vi-VN",
                                              {
                                                  day: "numeric",
                                                  month: "long",
                                                  year: "numeric",
                                              }
                                          )
                                        : "Continuous"}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                {task.title}
                            </h1>
                            <p className="text-slate-600 leading-relaxed">
                                {task.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <User size={14} />
                                <span>
                                    Assigned by{" "}
                                    <span className="font-semibold text-slate-700">
                                        {task.assignerName}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                            <EditTaskForm
                                task={task}
                                canEditDetails={canEditDetails}
                                canComplete={currentUser?.role === "ADMIN" || task.assignedBy === session.user.id}
                            />
                            {!canEditDetails && (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
                                        Update Status
                                    </p>
                                    <UpdateTaskStatusButton
                                        id={task.id}
                                        currentStatus={task.status}
                                        canComplete={currentUser?.role === "ADMIN" || task.assignedBy === session.user.id}
                                    />
                                </div>
                            )}
                            <DeleteTaskButton id={task.id} />
                        </div>
                    </div>
                </div>

                {/* Task Items Board - Cần làm / Đang làm / Đã làm */}
                <div className="border-t border-slate-100 p-8 md:p-10 bg-slate-50/20">
                    <TaskItemBoard taskId={taskId} initialItems={taskItems} />
                </div>

                {/* Participants Section */}
                <div className="border-t border-slate-100 p-8 md:p-10 bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <Users size={18} className="text-indigo-500" />
                        Participating Members
                    </h3>
                    <TaskParticipantsManager
                        task={task as { id: string; participants: { id: string; name: string; email: string }[] }}
                        allEmployees={assignableEmployees}
                    />
                </div>
            </div>
        </div>
    );
}
