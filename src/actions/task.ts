"use server";

import db, { readDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

export async function getTasks(filters?: { employeeId?: string, assignedBy?: string }) {
    return await db.task.findMany({ where: filters });
}

export async function createTaskAction(formData: FormData, assignedBy: string) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const employeeId = formData.get("employeeId") as string;
    const dueDate = formData.get("dueDate") as string;

    if (!title || !description || !employeeId) {
        return { error: "Title, description, and assigned employee are required" };
    }

    try {
        const data = readDb();
        const assignerUser = data.users.find(u => u.id === assignedBy);

        // If assigner is an employee, they must be the recipient's manager (direct or indirect)
        if (assignerUser?.role === "EMPLOYEE" && assignerUser.employeeId) {
            const isSub = await db.employee.isSubordinate(assignerUser.employeeId, employeeId);
            if (!isSub) {
                return { error: "Permission denied: You can only assign tasks to your subordinates." };
            }
        }

        const newTask = await db.task.create({
            data: {
                title,
                description,
                employeeId,
                assignedBy,
                dueDate: dueDate || null
            }
        });

        // Create notification for employee
        const recipientUser = data.users.find(u => u.employeeId === employeeId);

        if (recipientUser) {
            await db.notification.create({
                data: {
                    userId: recipientUser.id,
                    message: `New task assigned: ${title}`,
                    type: 'TASK_ASSIGNED',
                    relatedId: newTask.id
                }
            });
        }

        // Log history
        const session = await getSession();
        if (session?.user) {
            await db.history.create({
                data: {
                    action: "Assigned a new task",
                    details: `Task: "${title}" assigned to employee ID: ${employeeId}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: newTask.id,
                    targetName: title,
                    type: 'TASK'
                }
            });
        }

        revalidatePath("/tasks");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create task" };
    }
}

export async function updateTaskStatusAction(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    try {
        const task = await db.task.update({
            where: { id },
            data: { status }
        });

        // Notify admin if task is completed
        if (status === 'COMPLETED') {
            await db.notification.create({
                data: {
                    userId: task.assignedBy,
                    message: `Task completed: ${task.title}`,
                    type: 'TASK_COMPLETED',
                    relatedId: task.id
                }
            });
        }

        const session = await getSession();
        if (session?.user) {
            await db.history.create({
                data: {
                    action: `Task ${status.toLowerCase().replace('_', ' ')}`,
                    details: `Task: "${task.title}" updated to status ${status}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: task.id,
                    targetName: task.title,
                    type: 'TASK'
                }
            });
        }

        revalidatePath("/tasks");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update task status" };
    }
}

export async function deleteTaskAction(id: string) {
    try {
        await db.task.delete({ where: { id } });

        const session = await getSession();
        if (session?.user) {
            await db.history.create({
                data: {
                    action: "Deleted a task",
                    details: `Task ID: ${id} was removed from the system`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: id,
                    type: 'TASK'
                }
            });
        }

        revalidatePath("/tasks");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete task" };
    }
}
