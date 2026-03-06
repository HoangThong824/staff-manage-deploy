"use client";

import { useState } from "react";
import { LayoutList, LayoutGrid } from "lucide-react";
import { TaskBoard } from "./TaskBoard";
import { TaskListView, TaskListEmpty } from "./TaskListView";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db";

type TaskWithParticipants = Task & {
    participants: { id: string; name: string; email: string }[];
};

interface TasksViewToggleProps {
    tasks: TaskWithParticipants[];
    isAdmin: boolean;
}

export function TasksViewToggle({ tasks, isAdmin }: TasksViewToggleProps) {
    const [view, setView] = useState<"board" | "list">("board");

    return (
        <div className="space-y-6">
            {/* View toggle */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-2">
                    View:
                </span>
                <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setView("board")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                            view === "board"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <LayoutGrid size={18} />
                        Board
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                            view === "list"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <LayoutList size={18} />
                        List
                    </button>
                </div>
            </div>

            {/* Content */}
            {tasks.length === 0 ? (
                <TaskListEmpty isAdmin={isAdmin} />
            ) : view === "board" ? (
                <TaskBoard initialTasks={tasks} isAdmin={isAdmin} />
            ) : (
                <TaskListView tasks={tasks} isAdmin={isAdmin} />
            )}
        </div>
    );
}
