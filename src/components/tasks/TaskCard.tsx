"use client";

import { memo } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Users, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db";

type TaskWithParticipants = Task & {
    participants: { id: string; name: string; email: string }[];
};

interface TaskCardProps {
    task: TaskWithParticipants;
    isAdmin: boolean;
    statusColor: (status: string) => string;
    DeleteButton?: React.ComponentType<{ id: string }>;
    UpdateStatusButton?: React.ComponentType<{
        id: string;
        currentStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    }>;
    /** When true, render as static preview (e.g. for DragOverlay - no sortable hook) */
    asOverlay?: boolean;
}

/** Static card content - used for DragOverlay (no useSortable) */
function TaskCardContent({
    task,
    isAdmin,
    statusColor,
    DeleteButton,
    UpdateStatusButton,
    showActions,
    showLink = true,
}: TaskCardProps & { showActions: boolean; showLink?: boolean }) {
    return (
        <div className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border",
                        statusColor(task.status)
                    )}
                >
                    {task.status.replace("_", " ")}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} />
                    {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "Continuous"}
                </span>
            </div>
            {showLink ? (
                <Link
                    href={`/tasks/${task.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 group/link"
                >
                    <span className="line-clamp-2">{task.title}</span>
                    <ExternalLink size={12} className="flex-shrink-0 opacity-0 group-hover/link:opacity-60" />
                </Link>
            ) : (
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {task.title}
                </h3>
            )}
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                {task.description}
            </p>
            {task.participants?.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                    <Users size={12} className="text-slate-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                        {task.participants.slice(0, 3).map((p: { id: string; name: string }) => (
                            <div
                                key={p.id}
                                className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100"
                                title={p.name}
                            >
                                <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                                    {p.name[0]}
                                </div>
                                <span className="text-[10px] font-medium text-slate-600 truncate max-w-[60px]">
                                    {p.name}
                                </span>
                            </div>
                        ))}
                        {task.participants.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                                +{task.participants.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}
            {showActions && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    {!isAdmin && UpdateStatusButton && (
                        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                            <UpdateStatusButton id={task.id} currentStatus={task.status} />
                        </div>
                    )}
                    <div className="ml-auto">
                        {DeleteButton && <DeleteButton id={task.id} />}
                    </div>
                </div>
            )}
        </div>
    );
}

export const TaskCard = memo(function TaskCard({
    task,
    isAdmin,
    statusColor,
    DeleteButton,
    UpdateStatusButton,
    asOverlay = false,
}: TaskCardProps) {
    if (asOverlay) {
        return (
            <div className="group bg-white rounded-2xl shadow-2xl shadow-slate-300/40 border-2 border-indigo-200 overflow-hidden w-[320px]">
                <TaskCardContent
                    task={task}
                    isAdmin={isAdmin}
                    statusColor={statusColor}
                    DeleteButton={DeleteButton}
                    UpdateStatusButton={UpdateStatusButton}
                    showActions={false}
                    showLink={false}
                />
            </div>
        );
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: "task", task },
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
                "group bg-white rounded-2xl shadow-lg shadow-slate-200/20 border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden cursor-grab active:cursor-grabbing",
                isDragging && "opacity-90 shadow-2xl ring-2 ring-indigo-400 ring-offset-2 z-50"
            )}
        >
            <TaskCardContent
                task={task}
                isAdmin={isAdmin}
                statusColor={statusColor}
                DeleteButton={DeleteButton}
                UpdateStatusButton={UpdateStatusButton}
                showActions={true}
            />
        </div>
    );
});

