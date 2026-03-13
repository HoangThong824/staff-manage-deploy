"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ListTodo, RefreshCw, CheckCircle2 } from "lucide-react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/lib/db";

type TaskWithParticipants = Task & {
    participants: { id: string; name: string; email: string }[];
};

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const COLUMN_CONFIG: Record<
    TaskStatus,
    { label: string; Icon: typeof ListTodo; bg: string; border: string }
> = {
    PENDING: {
        label: "To Do",
        Icon: ListTodo,
        bg: "bg-amber-50",
        border: "border-amber-200",
    },
    IN_PROGRESS: {
        label: "In Progress",
        Icon: RefreshCw,
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    COMPLETED: {
        label: "Completed",
        Icon: CheckCircle2,
        bg: "bg-emerald-50",
        border: "border-emerald-200",
    },
};

interface TaskColumnProps {
    status: TaskStatus;
    tasks: TaskWithParticipants[];
    isAdmin: boolean;
    getStatusColor: (status: string) => string;
    DeleteButton?: React.ComponentType<{ id: string }>;
    UpdateStatusButton?: React.ComponentType<{
        id: string;
        currentStatus: TaskStatus;
    }>;
}

export const TaskColumn = memo(function TaskColumn({
    status,
    tasks,
    isAdmin,
    getStatusColor,
    DeleteButton,
    UpdateStatusButton,
}: TaskColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const config = COLUMN_CONFIG[status];

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-[340px] flex flex-col rounded-2xl border-2 transition-colors min-h-[200px]",
                config.bg,
                config.border,
                isOver && "ring-2 ring-indigo-400 ring-offset-2"
            )}
        >
            {/* Column header */}
            <div className="p-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                <config.Icon size={20} className="text-slate-600 flex-shrink-0" />
                    <h3 className="font-bold text-slate-800">{config.label}</h3>
                    <span className="ml-auto text-sm font-semibold text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isAdmin={isAdmin}
                            statusColor={getStatusColor}
                            DeleteButton={DeleteButton}
                            UpdateStatusButton={UpdateStatusButton}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                            <config.Icon size={28} className="mb-2 opacity-50" />
                            <p>Drop tasks here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
});
