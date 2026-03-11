"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import type { TaskItem } from "@/lib/db";

interface TaskItemCardProps {
    item: TaskItem;
    participants: { id: string; name: string; email: string }[];
    assignedBy: string;
    allowedAssigneeIds: string[] | null;
    onDelete: (id: string) => void;
    isOverlay?: boolean;
}

function TaskItemCardContent({
    item,
    participants,
    assignedBy,
    allowedAssigneeIds,
    onDelete,
    isOverlay,
}: TaskItemCardProps) {
    const { session, updateTaskItem } = useData();

    const currentUserRole = session?.user?.role;
    const currentUserId = session?.user?.id;
    const currentEmployeeId = session?.user?.employeeId;

    const canDrag =
        currentUserRole === "ADMIN" ||
        currentUserId === assignedBy ||
        (currentEmployeeId && item.employeeId === currentEmployeeId);
    const assignedMember = participants.find(p => p.id === item.employeeId);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (isOverlay) {
        return (
            <div className="group flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-slate-200 min-w-[240px]">
                <div title={!canDrag ? "Bạn không có quyền di chuyển task này" : ""}>
                    <GripVertical size={14} className={cn("text-slate-300 flex-shrink-0", !canDrag && "opacity-20 cursor-not-allowed")} />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                    {item.title}
                </span>
                {assignedMember && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-200" title={assignedMember.name}>
                        {getInitials(assignedMember.name)}
                    </div>
                )}
            </div>
        );
    }
    return (
        <>
            <div title={!canDrag ? "Bạn không có quyền di chuyển task này" : ""}>
                <GripVertical size={14} className={cn("text-slate-300 flex-shrink-0", !canDrag && "opacity-20 cursor-not-allowed")} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-800 truncate block">
                    {item.title}
                </span>
                <div className="flex items-center gap-2">
                    <select
                        value={item.employeeId || ""}
                        onChange={async (e) => {
                            e.stopPropagation();
                            await updateTaskItem(item.id, { employeeId: e.target.value || undefined });
                            window.location.reload(); // Refresh to show changes if local state isn't enough
                        }}
                        className="text-[10px] bg-transparent border-none text-slate-400 focus:ring-0 p-0 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="">Unassigned</option>
                        {participants
                            .filter(p => !allowedAssigneeIds || allowedAssigneeIds.includes(p.id))
                            .map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                    </select>
                </div>
            </div>
            {assignedMember && (
                <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500 border border-indigo-100 flex-shrink-0" title={assignedMember.name}>
                    {getInitials(assignedMember.name)}
                </div>
            )}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Xóa nội dung này?")) onDelete(item.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                title="Xóa"
            >
                <Trash2 size={14} />
            </button>
        </>
    );
}

export function TaskItemCard({ item, participants, assignedBy, allowedAssigneeIds, onDelete, isOverlay }: TaskItemCardProps) {
    const { session } = useData();

    const currentUserEmail = session?.user?.email;
    const currentUserRole = session?.user?.role;
    const currentUserId = session?.user?.id;
    const currentEmployeeId = session?.user?.employeeId;

    // Permissions: Admin, Task Creator (AssignedBy is User ID), Subtask Assignee (EmployeeId), or Subtask Creator
    const canDrag =
        currentUserRole === "ADMIN" ||
        currentUserId === assignedBy ||
        currentUserId === item.createdBy ||
        (currentEmployeeId && item.employeeId === currentEmployeeId);

    if (isOverlay) {
        return <TaskItemCardContent item={item} participants={participants} assignedBy={assignedBy} allowedAssigneeIds={allowedAssigneeIds} onDelete={onDelete} isOverlay />;
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
        disabled: !canDrag
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(canDrag ? attributes : {})}
            {...(canDrag ? listeners : {})}
            className={cn(
                "group flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-100 transition-all",
                canDrag ? "hover:border-indigo-200 hover:shadow-sm cursor-grab active:cursor-grabbing" : "cursor-default opacity-80",
                isDragging && "opacity-90 shadow-lg ring-2 ring-indigo-300 z-50",
                item.employeeId && "border-l-4 border-l-indigo-400"
            )}
        >
            <TaskItemCardContent item={item} participants={participants} assignedBy={assignedBy} allowedAssigneeIds={allowedAssigneeIds} onDelete={onDelete} />
        </div>
    );
}
