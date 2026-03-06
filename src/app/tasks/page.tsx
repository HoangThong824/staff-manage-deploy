"use client";

import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssignTaskForm } from "@/components/admin/AssignTaskForm";
import { TaskListView, TaskListEmpty } from "@/components/tasks/TaskListView";

export default function TasksPage() {
    const { session, loading, getTasks, getEmployees, getSubordinates } = useData();
    const router = useRouter();

    const [tasks, setTasks] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [subordinates, setSubordinates] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !session) {
            router.push("/login");
        }
    }, [session, loading, router]);

    useEffect(() => {
        async function loadData() {
            if (!session) return;
            const isAdmin = session.user?.role === "ADMIN";
            const employeeId = session.user?.employeeId;

            const t = isAdmin
                ? await getTasks()
                : await getTasks({ employeeId: employeeId! });

            setTasks(t);

            if (isAdmin) {
                const e = await getEmployees();
                setEmployees(e);
            } else if (employeeId) {
                const s = await getSubordinates(employeeId);
                setSubordinates(s);
            }
            setDataLoading(false);
        }
        if (session && !loading) loadData();
    }, [session, loading, getTasks, getEmployees, getSubordinates]);

    if (loading || dataLoading || !session) return <div className="p-10 text-center font-bold">Loading Tasks...</div>;

    const isAdmin = session.user?.role === "ADMIN";

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
                <div className="relative">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {isAdmin ? "Academic Assignments" : "My Tasks"}
                    </h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">
                        {isAdmin
                            ? "Monitor and distribute workload across your faculty team."
                            : "Manage and track your assigned tasks and collaborations."}
                    </p>
                </div>
                <div className="relative">
                    {isAdmin && (
                        <AssignTaskForm employees={employees} adminId={session.user.id} />
                    )}
                    {!isAdmin && subordinates.length > 0 && (
                        <AssignTaskForm employees={subordinates} adminId={session.user.id} />
                    )}
                </div>
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
