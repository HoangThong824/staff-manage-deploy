"use client";

import { useState } from "react";
import { deleteEmployeeAction } from "@/actions/employee";
import { Trash2 } from "lucide-react";

export function DeleteEmployeeButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this employee?")) return;

        setIsDeleting(true);
        const result = await deleteEmployeeAction(id);

        if (result.error) {
            alert(result.error);
        }
        setIsDeleting(false);
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete Employee"
        >
            <Trash2 size={18} />
        </button>
    );
}
