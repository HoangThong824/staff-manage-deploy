import { getTasks } from "@/actions/task";
import { getEmployees } from "@/actions/employee";
import { getSession } from "@/lib/auth/session";
import { AssignTaskForm } from "@/components/admin/AssignTaskForm";
import { TaskListView, TaskListEmpty } from "@/components/tasks/TaskListView";
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

            {/* Task list */}
            {tasks.length === 0 ? (
                <TaskListEmpty isAdmin={isAdmin} />
            ) : (
                <TaskListView tasks={tasks} isAdmin={isAdmin} currentUserId={session.user.id} />
            )}
        </div>
    );
}
