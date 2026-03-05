"use server";

import db, { readDb, writeDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

export async function getTasks(filters?: { employeeId?: string, assignedBy?: string }) {
    return await db.task.findMany({ where: filters });
}

export async function createTaskAction(formData: FormData, assignedBy: string) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const employeeIds = formData.getAll("employeeId") as string[]; // Multiple selection
    const dueDate = formData.get("dueDate") as string;

    if (!title || !description || !employeeIds || employeeIds.length === 0) {
        return { error: "Title, description, and at least one assigned employee are required" };
    }

    try {
        const data = readDb();
        const assignerUser = data.users.find(u => u.id === assignedBy);

        // If assigner is an employee, they must be the recipient's manager (direct or indirect)
        // If assigner is an employee, they must be the manager of ALL recipients
        if (assignerUser?.role === "EMPLOYEE" && assignerUser.employeeId) {
            for (const empId of employeeIds) {
                const isSub = await db.employee.isSubordinate(assignerUser.employeeId, empId);
                if (!isSub && assignerUser.employeeId !== empId) {
                    return { error: `Permission denied: You can only assign tasks to yourself or your subordinates. Failed for ID: ${empId}` };
                }
            }
        } else if (assignerUser?.role !== "ADMIN") {
            // Only Admin or Employee (as manager) can assign tasks
            return { error: "Permission denied: You do not have permission to assign tasks." };
        }

        const newTask = await db.task.create({
            data: {
                title,
                description,
                employeeIds,
                assignedBy,
                dueDate: dueDate || null
            }
        });

        // Create notification for employees
        for (const empId of employeeIds) {
            const recipientUser = data.users.find(u => u.employeeId === empId);
            if (recipientUser) {
                await db.notification.create({
                    data: {
                        userId: recipientUser.id,
                        message: `New collaborative task assigned: ${title}`,
                        type: 'TASK_ASSIGNED',
                        relatedId: newTask.id
                    }
                });
            }
        }

        // Log history
        const session = await getSession();
        if (session?.user) {
            await db.history.create({
                data: {
                    action: "Assigned a task",
                    details: `Task: "${title}" assigned to ${employeeIds.length} employees`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: newTask.id,
                    targetName: title,
                    type: 'TASK'
                }
            });
        }

        revalidatePath("/", "layout");
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

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update task status" };
    }
}

export async function deleteTaskAction(id: string) {
    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };

        const data = readDb();
        const task = data.tasks.find(t => t.id === id);
        if (!task) return { error: "Task not found" };

        const currentUser = data.users.find(u => u.id === session.user.id);

        let canDelete = false;

        if (currentUser?.role === "ADMIN") {
            canDelete = true;
        } else if (task.assignedBy === session.user.id) {
            canDelete = true;
        } else if (currentUser?.employeeId) {
            // If manager of ANY of the persons the task is assigned to
            let isManagerOfAny = false;
            for (const empId of task.employeeIds) {
                const isSub = await db.employee.isSubordinate(currentUser.employeeId, empId);
                if (isSub) {
                    isManagerOfAny = true;
                    break;
                }
            }
            if (isManagerOfAny) canDelete = true;
        }

        if (!canDelete) {
            return { error: "Permission denied: You do not have permission to delete this task." };
        }

        await db.task.delete({ where: { id } });

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

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete task" };
    }
}

export async function addMemberToTaskAction(taskId: string, employeeId: string) {
    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };

        const data = readDb();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return { error: "Task not found" };

        if (data.tasks[taskIndex].employeeIds.includes(employeeId)) {
            return { error: "Employee already assigned to this task" };
        }

        const currentUser = data.users.find(u => u.id === session.user.id);

        // Permission Check
        let hasPermission = false;
        if (currentUser?.role === "ADMIN" || data.tasks[taskIndex].assignedBy === session.user.id) {
            hasPermission = true;
        } else if (currentUser?.employeeId) {
            const isSub = await db.employee.isSubordinate(currentUser.employeeId, employeeId);
            if (isSub) hasPermission = true;
        }

        if (!hasPermission) return { error: "Permission denied" };

        data.tasks[taskIndex].employeeIds.push(employeeId);
        data.tasks[taskIndex].updatedAt = new Date().toISOString();
        writeDb(data);

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to add member" };
    }
}

export async function removeMemberFromTaskAction(taskId: string, employeeId: string) {
    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };

        const data = readDb();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return { error: "Task not found" };

        if (!data.tasks[taskIndex].employeeIds.includes(employeeId)) {
            return { error: "Employee not assigned to this task" };
        }

        if (data.tasks[taskIndex].employeeIds.length <= 1) {
            return { error: "Cannot remove the last member. Delete the task instead." };
        }

        const currentUser = data.users.find(u => u.id === session.user.id);

        // Permission Check
        let hasPermission = false;
        if (currentUser?.role === "ADMIN" || data.tasks[taskIndex].assignedBy === session.user.id) {
            hasPermission = true;
        } else if (currentUser?.employeeId) {
            const isSub = await db.employee.isSubordinate(currentUser.employeeId, employeeId);
            if (isSub) hasPermission = true;
        }

        if (!hasPermission) return { error: "Permission denied" };

        data.tasks[taskIndex].employeeIds = data.tasks[taskIndex].employeeIds.filter(id => id !== employeeId);
        data.tasks[taskIndex].updatedAt = new Date().toISOString();
        writeDb(data);

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to remove member" };
    }
}
