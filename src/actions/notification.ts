"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    return await db.notification.findMany({
        where: { userId: session.user.id }
    });
}

export async function markAsReadAction(id: string) {
    try {
        await db.notification.update({
            where: { id },
            data: { isRead: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to mark notification as read" };
    }
}

export async function markAllAsReadAction() {
    const session = await getSession();
    if (!session) return { error: "Not authenticated" };

    try {
        await db.notification.markAllAsRead(session.user.id);
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to mark all as read" };
    }
}
