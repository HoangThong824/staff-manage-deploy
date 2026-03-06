"use client";

import { useState } from "react";
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
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { UpdateTaskStatusButton } from "@/components/employee/UpdateTaskStatusButton";
import type { Task } from "@/lib/db";

type TaskWithParticipants = Task & {
    participants: { id: string; name: string; email: string }[];
};

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

interface TaskBoardProps {
    initialTasks: TaskWithParticipants[];
    isAdmin: boolean;
}

const STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

function getStatusColor(status: string) {
    if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "IN_PROGRESS") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
}

export function TaskBoard({ initialTasks, isAdmin }: TaskBoardProps) {
    const { updateTask } = useData();
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks);
    const [activeTask, setActiveTask] = useState<TaskWithParticipants | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor)
    );

    const tasksByStatus = STATUSES.reduce((acc, status) => {
        acc[status] = tasks.filter((t) => t.status === status);
        return acc;
    }, {} as Record<TaskStatus, TaskWithParticipants[]>);

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const task = tasks.find((t) => t.id === active.id);
        if (task) setActiveTask(task);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        let targetStatus: TaskStatus | null = null;

        // over.id can be: column status (PENDING/IN_PROGRESS/COMPLETED) or another task id
        if (STATUSES.includes(over.id as TaskStatus)) {
            targetStatus = over.id as TaskStatus;
        } else {
            const overTask = tasks.find((t) => t.id === over.id);
            if (overTask) targetStatus = overTask.status;
        }

        if (!targetStatus) return;

        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === targetStatus) return;

        // Optimistic update
        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId ? { ...t, status: targetStatus! } : t
            )
        );

        try {
            await updateTask(taskId, { status: targetStatus });
        } catch (err: any) {
            setTasks(initialTasks);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2">
                {STATUSES.map((status) => (
                    <TaskColumn
                        key={status}
                        status={status}
                        tasks={tasksByStatus[status]}
                        isAdmin={isAdmin}
                        getStatusColor={getStatusColor}
                        DeleteButton={DeleteTaskButton}
                        UpdateStatusButton={UpdateTaskStatusButton}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="rotate-2 scale-105">
                        <TaskCard
                            task={activeTask}
                            isAdmin={isAdmin}
                            statusColor={getStatusColor}
                            DeleteButton={DeleteTaskButton}
                            UpdateStatusButton={UpdateTaskStatusButton}
                            asOverlay
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

