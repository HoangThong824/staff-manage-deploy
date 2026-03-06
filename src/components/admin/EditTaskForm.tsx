"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskWithParticipants = {
    id: string;
    title: string;
    description: string;
    dueDate: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    participants: { id: string; name: string }[];
};

interface EditTaskFormProps {
    task: TaskWithParticipants;
    canEditDetails: boolean;
    canComplete?: boolean;
    onSuccess?: () => void;
    triggerClassName?: string;
}

export function EditTaskForm({
    task,
    canEditDetails,
    canComplete = true,
    onSuccess,
    triggerClassName,
}: EditTaskFormProps) {
    const { updateTask } = useData();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = e.currentTarget;
        const formData = new FormData(form);
        try {
            await updateTask(task.id, {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                dueDate: (formData.get("dueDate") as string) || null,
                status: formData.get("status") as "PENDING" | "IN_PROGRESS" | "COMPLETED",
            });
            setIsOpen(false);
            onSuccess?.();
            window.location.reload();
        } catch (err: any) {
            setError(err.message || "Failed to update task");
        }
        setLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-semibold text-sm",
                    triggerClassName
                )}
            >
                <Pencil size={16} />
                Edit
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Edit Task</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {canEditDetails && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Title</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={task.title}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    defaultValue={task.description}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Due Date</label>
                                <input
                                    name="dueDate"
                                    type="date"
                                    defaultValue={task.dueDate || ""}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Status</label>
                        <select
                            name="status"
                            defaultValue={task.status}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        >
                            <option value="PENDING">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            {canComplete && <option value="COMPLETED">Completed</option>}
                        </select>
                        {!canComplete && (
                            <p className="text-xs text-slate-500">Only the person who created the task can mark it as completed.</p>
                        )}
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
