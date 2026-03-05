"use client";

import { useState } from "react";
import { updateTaskStatusAction } from "@/actions/task";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

export function UpdateTaskStatusButton({ id, currentStatus }: { id: string, currentStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" }) {
    const [loading, setLoading] = useState(false);

    async function handleStatusChange(newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
        setLoading(true);
        await updateTaskStatusAction(id, newStatus);
        setLoading(false);
    }

    return (
        <div className="flex gap-2 text-sm">
            <button
                onClick={() => handleStatusChange("PENDING")}
                disabled={loading || currentStatus === "PENDING"}
                className={`p-1.5 rounded-md flex items-center transition-colors ${currentStatus === "PENDING" ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-400 hover:bg-gray-100"}`}
                title="Mark Pending"
            >
                <Clock size={16} />
                <span className="sr-only">Pending</span>
            </button>
            <button
                onClick={() => handleStatusChange("IN_PROGRESS")}
                disabled={loading || currentStatus === "IN_PROGRESS"}
                className={`p-1.5 rounded-md flex items-center transition-colors ${currentStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-400 hover:bg-gray-100"}`}
                title="Mark In Progress"
            >
                <PlayCircle size={16} />
                <span className="sr-only">In Progress</span>
            </button>
            <button
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={loading || currentStatus === "COMPLETED"}
                className={`p-1.5 rounded-md flex items-center transition-colors ${currentStatus === "COMPLETED" ? "bg-emerald-100 text-emerald-700 font-medium" : "text-gray-400 hover:bg-gray-100"}`}
                title="Mark Completed"
            >
                <CheckCircle2 size={16} />
                <span className="sr-only">Completed</span>
            </button>
        </div>
    );
}
