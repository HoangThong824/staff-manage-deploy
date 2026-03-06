"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";

export function DeleteEmployeeButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteEmployee, deleteUser, data, createHistory, session } = useData();

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this faculty member? All associated records will be removed.")) return;

        setIsDeleting(true);
        try {
            const emp = data.employees.find(e => e.id === id);
            if (!emp) throw new Error("Faculty member not found");

            await deleteEmployee(id);

            // 2. Delete User account if exists
            const associatedUser = data.users.find(u => u.employeeId === id || u.email === emp.email);
            if (associatedUser) {
                await deleteUser(associatedUser.id);
            }

            // 3. Log history
            if (session?.user) {

                await createHistory({
                    action: "Removed faculty member",
                    details: `Deleted employee ${emp.firstName} ${emp.lastName}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: emp.id,
                    targetName: `${emp.firstName} ${emp.lastName}`,
                    type: 'EMPLOYEE'
                });
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete faculty member");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-rose-500 hover:text-rose-700 p-2.5 rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50 group"
            title="Remove Faculty"
        >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}

