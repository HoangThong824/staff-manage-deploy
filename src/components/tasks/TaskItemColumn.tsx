"use client";

import { useDroppable } from "@dnd-kit/core";
import { ListTodo, RefreshCw, CheckCircle2 } from "lucide-react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { TaskItemCard } from "./TaskItemCard";
import type { TaskItem } from "@/lib/db";

type ItemStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

/**
 * COLUMN_CONFIG: Maps each task-item status to UI presentation metadata.
 * Cấu hình UI theo trạng thái (label, icon, màu nền/viền) cho từng cột Kanban.
 */
const COLUMN_CONFIG: Record<
    ItemStatus,
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
        label: "Done",
        Icon: CheckCircle2,
        bg: "bg-emerald-50",
        border: "border-emerald-200",
    },
};

interface TaskItemColumnProps {
    status: ItemStatus;
    items: TaskItem[];
    participants: { id: string; name: string; email: string }[];
    assignedBy: string;
    allowedAssigneeIds: string[] | null;
    onDelete: (id: string) => void;
}

/**
 * TaskItemColumn: A droppable + sortable Kanban column for task items.
 * - Receives items already filtered by `status`
 * - Exposes a drop zone via dnd-kit (`useDroppable`) using `status` as the droppable id
 * - Renders `TaskItemCard` inside a `SortableContext` so items can be reordered/moved
 */
export function TaskItemColumn({
    status,
    items,
    participants,
    assignedBy,
    allowedAssigneeIds,
    onDelete,
}: TaskItemColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const config = COLUMN_CONFIG[status];

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-[280px] flex flex-col rounded-2xl border-2 transition-colors min-h-[160px]",
                config.bg,
                config.border,
                isOver && "ring-2 ring-indigo-400 ring-offset-2"
            )}
        >
            <div className="p-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                <config.Icon size={18} className="text-slate-600 flex-shrink-0" />
                    <h3 className="font-bold text-slate-800 text-sm">
                        {config.label}
                    </h3>
                    <span className="ml-auto text-xs font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
            </div>

            <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[360px]">
                    {items.map((item) => (
                        <TaskItemCard
                            key={item.id}
                            item={item}
                            participants={participants}
                            assignedBy={assignedBy}
                            allowedAssigneeIds={allowedAssigneeIds}
                            onDelete={onDelete}
                        />
                    ))}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs">
                            <config.Icon size={24} className="mb-1 opacity-50" />
                            <p>Drag items here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
