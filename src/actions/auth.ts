"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { login, logout } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        return { error: "Invalid email or password" };
    }

    await login({ id: user.id, email: user.email, name: user.name, role: user.role, employeeId: user.employeeId });
    redirect("/");
}

export async function logoutAction() {
    await logout();
    redirect("/login");
}

export async function changePasswordAction(formData: FormData) {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    const { getSession } = await import("@/lib/auth/session");
    const session = await getSession();

    if (!session || !session.user) {
        return { error: "Not authenticated" };
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user || !user.password || !(await bcrypt.compare(currentPassword, user.password))) {
        return { error: "Incorrect current password" };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
    });

    // Log history
    await db.history.create({
        data: {
            action: "Password updated",
            details: "User successfully changed their account password",
            userId: user.id,
            userName: user.name || user.email,
            type: 'AUTH'
        }
    });

    return { success: "Password updated successfully" };
}
