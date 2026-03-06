"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/lib/db";

interface TaskItemCardProps {
    item: TaskItem;
    onDelete: (id: string) => void;
    isOverlay?: boolean;
}

function TaskItemCardContent({
    item,
    onDelete,
    isOverlay,
}: TaskItemCardProps) {
    if (isOverlay) {
        return (
            <div className="group flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-slate-200 min-w-[240px]">
                <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                    {item.title}
                </span>
            </div>
        );
    }
    return (
        <>
            <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                {item.title}
            </span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Xóa nội dung này?")) onDelete(item.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Xóa"
            >
                <Trash2 size={14} />
            </button>
        </>
    );
}

export function TaskItemCard({ item, onDelete, isOverlay }: TaskItemCardProps) {
    if (isOverlay) {
        return <TaskItemCardContent item={item} onDelete={onDelete} isOverlay />;
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: { type: "task-item", item },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-90 shadow-lg ring-2 ring-indigo-300 z-50"
            )}
        >
            <TaskItemCardContent item={item} onDelete={onDelete} />
        </div>
    );
}
