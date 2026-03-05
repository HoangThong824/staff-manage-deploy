"use client";

import { Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/actions/task";
import { useState } from "react";

interface DeleteTaskButtonProps {
    id: string;
}

export function DeleteTaskButton({ id }: DeleteTaskButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        setIsLoading(true);
        try {
            await deleteTaskAction(id);
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Failed to delete task");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete task"
        >
            <Trash2 size={18} className={isLoading ? "animate-pulse" : ""} />
        </button>
    );
}
