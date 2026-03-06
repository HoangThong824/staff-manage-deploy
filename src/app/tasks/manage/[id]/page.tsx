"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { AssignTaskForm } from "@/components/admin/AssignTaskForm";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { TaskParticipantsManager } from "@/components/admin/TaskParticipantsManager";
import {
    ClipboardList,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users
} from "lucide-react";
import Link from "next/link";
import { Employee, Task } from "@/lib/db";

export default function ManageEmployeeTasksPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { session, data, loading, getTasks, getSubordinates } = useData();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [assignableEmployees, setAssignableEmployees] = useState<Employee[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!session) {
                router.push("/login");
                return;
            }

            const emp = data.employees.find(e => e.id === id);
            if (!emp) {
                setHasPermission(false);
                return;
            }
            setEmployee(emp);

            const currentUser = data.users.find(u => u.id === session.user.id);

            // Permission check logic
            const checkPerms = async () => {
                if (currentUser?.role === "ADMIN") {
                    setHasPermission(true);
                    setAssignableEmployees(data.employees);
                } else if (currentUser?.employeeId) {
                    const subs = await getSubordinates(currentUser.employeeId);
                    const isSub = subs.some(s => s.id === id);
                    if (isSub || currentUser.employeeId === id) {
                        setHasPermission(true);
                        setAssignableEmployees(subs);
                    } else {
                        setHasPermission(false);
                    }
                } else {
                    setHasPermission(false);
                }
            };

            checkPerms();
        }
    }, [id, session, loading, data, router, getSubordinates]);

    useEffect(() => {
        if (hasPermission) {
            getTasks({ employeeId: id }).then(setTasks);
        }
    }, [id, hasPermission, getTasks]);

    if (loading || hasPermission === null) return <div className="p-10 text-center font-bold">Loading...</div>;

    if (hasPermission === false) {
        router.push("/");
        return null;
    }

    if (!employee) return <div className="p-10 text-center font-bold text-red-500">Employee not found</div>;

    const getStatusIcon = (status: string) => {
        if (status === 'COMPLETED') return <CheckCircle2 size={16} className="text-emerald-500" />;
        if (status === 'IN_PROGRESS') return <Clock size={16} className="text-blue-500" />;
        return <AlertCircle size={16} className="text-amber-500" />;
    };

    const getStatusStyles = (status: string) => {
        if (status === 'COMPLETED') return 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50';
        if (status === 'IN_PROGRESS') return 'bg-blue-50/50 text-blue-700 border-blue-100/50';
        return 'bg-amber-50/50 text-amber-700 border-amber-100/50';
    };

    const currentUserRole = data.users.find(u => u.id === session?.user.id)?.role;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
                <Link
                    href={currentUserRole === 'ADMIN' ? '/employees' : '/my-team'}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to {currentUserRole === 'ADMIN' ? 'Staff Directory' : 'My Team'}
                </Link>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-xl shadow-lg uppercase">
                            {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                {employee.firstName} {employee.lastName}
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
                                Collaborative Task Management
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative z-10">
                    <AssignTaskForm
                        employees={assignableEmployees}
                        adminId={session?.user.id}
                        defaultEmployeeId={id}
                    />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/30 border border-slate-50 sticky top-8">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <ClipboardList className="text-indigo-500" size={20} />
                            Academic Roster
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Assigned Tasks', value: tasks.length, color: 'text-slate-900', bg: 'bg-slate-50' },
                                { label: 'Active Projects', value: tasks.filter(t => t.status !== 'COMPLETED').length, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Collaborative Groups', value: tasks.filter(t => t.employeeIds.length > 1).length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            ].map((stat) => (
                                <div key={stat.label} className={`flex justify-between items-center p-4 ${stat.bg} rounded-2xl`}>
                                    <span className="text-sm font-bold text-slate-500">{stat.label}</span>
                                    <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task List Section */}
                <div className="lg:col-span-2 space-y-6">
                    {tasks.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 border-dashed p-16 text-center shadow-lg shadow-slate-100/50">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                                <ClipboardList size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Active Assignments</h3>
                            <p className="text-slate-400 font-medium">This educator is not currently part of any academic tasks.</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="group bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/20 border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden">
                                <div className="p-8">
                                    <div className="flex justify-between items-start gap-4 mb-6">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyles(task.status)}`}>
                                                    {getStatusIcon(task.status)}
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Continuous'}
                                                </span>
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {task.title}
                                            </h4>
                                            <p className="text-slate-500 font-medium leading-relaxed">
                                                {task.description}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <DeleteTaskButton id={task.id} />
                                        </div>
                                    </div>

                                    {/* Members Section */}
                                    <div className="pt-6 border-t border-slate-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Users size={14} className="text-indigo-400" />
                                                Participating Faculty
                                            </h5>
                                        </div>

                                        <TaskParticipantsManager
                                            task={task as any}
                                            allEmployees={data.employees}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

