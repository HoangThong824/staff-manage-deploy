"use client";

import { useState } from "react";
import { createTaskAction } from "@/actions/task";
import { Employee } from "@/lib/db";

export function AssignTaskForm({
    employees,
    adminId,
    defaultEmployeeId
}: {
    employees: Employee[],
    adminId: string,
    defaultEmployeeId?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const res = await createTaskAction(formData, adminId);

        if (res.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
        }
        setLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                + Assign Task
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-semibold text-gray-800">Assign New Task</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Task Title</label>
                        <input
                            name="title"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. Complete Monthly Report"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                            placeholder="Task details..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Assign To (Select one or more)</label>
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-2 bg-white">
                            {employees.map(emp => (
                                <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                                    <input
                                        type="checkbox"
                                        name="employeeId"
                                        value={emp.id}
                                        defaultChecked={defaultEmployeeId === emp.id}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">{emp.firstName} {emp.lastName}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{emp.email}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Due Date (Optional)</label>
                        <input
                            name="dueDate"
                            type="date"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 focus:outline-none transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm shadow-blue-600/20"
                        >
                            {loading ? "Assigning..." : "Assign Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
