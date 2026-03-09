import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";

interface DeleteTaskButtonProps {
    id: string;
    canDelete?: boolean;
}

export function DeleteTaskButton({ id, canDelete = true }: DeleteTaskButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { deleteTask, createHistory, session, data } = useData();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task? Associated sub-tasks will also be removed.")) return;

        setIsLoading(true);
        try {
            const task = data.tasks.find(t => t.id === id);
            if (!task) throw new Error("Task not found");

            await deleteTask(id);

            // Log history
            if (session?.user) {
                await createHistory({
                    action: "Deleted a task",
                    details: `Task: "${task.title}" was removed from the system`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: id,
                    targetName: task.title,
                    type: 'TASK'
                });
            }
        } catch (error: any) {
            console.error("Failed to delete task:", error);
            alert(error.message || "Failed to delete task");
        } finally {
            setIsLoading(false);
        }
    };

    if (!canDelete) return null;

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
