"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { useData } from "@/context/DataContext";
import { TaskItemColumn } from "./TaskItemColumn";
import { TaskItemCard } from "./TaskItemCard";
import { AddTaskItemForm } from "./AddTaskItemForm";
import type { TaskItem } from "@/lib/db";

type ItemStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const STATUSES: ItemStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

interface TaskItemBoardProps {
    taskId: string;
    initialItems: TaskItem[];
}

export function TaskItemBoard({
    taskId,
    initialItems,
}: TaskItemBoardProps) {
    const { updateTaskItemStatus, deleteTaskItem } = useData();
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [activeItem, setActiveItem] = useState<TaskItem | null>(null);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const itemsByStatus = STATUSES.reduce((acc, status) => {
        acc[status] = items.filter((i) => i.status === status);
        return acc;
    }, {} as Record<ItemStatus, TaskItem[]>);

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const item = items.find((i) => i.id === active.id);
        if (item) setActiveItem(item);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveItem(null);
        if (!over) return;

        const itemId = active.id as string;
        let targetStatus: ItemStatus | null = null;

        if (STATUSES.includes(over.id as ItemStatus)) {
            targetStatus = over.id as ItemStatus;
        } else {
            const overItem = items.find((i) => i.id === over.id);
            if (overItem) targetStatus = overItem.status;
        }

        if (!targetStatus) return;

        const item = items.find((i) => i.id === itemId);
        if (!item || item.status === targetStatus) return;

        setItems((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, status: targetStatus! } : i
            )
        );

        try {
            await updateTaskItemStatus(itemId, targetStatus);
        } catch (err: any) {
            setItems(initialItems);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteTaskItem(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete item");
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                    Content
                </h3>
                <AddTaskItemForm taskId={taskId} onSuccess={() => router.refresh()} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                    {STATUSES.map((status) => (
                        <TaskItemColumn
                            key={status}
                            status={status}
                            items={itemsByStatus[status]}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeItem ? (
                        <div className="rotate-1 scale-105">
                            <TaskItemCard
                                item={activeItem}
                                onDelete={() => { }}
                                isOverlay
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
