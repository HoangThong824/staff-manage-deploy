"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";

export async function getEmployees() {
    return await db.employee.findMany();
}

export async function createEmployeeAction(formData: FormData) {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const positionTitle = formData.get("positionTitle") as string;
    const managerId = formData.get("managerId") as string || null;

    if (!firstName || !lastName || !email || !positionTitle) {
        return { error: "All fields are required" };
    }

    try {
        const employee = await db.employee.create({
            data: {
                firstName,
                lastName,
                email,
                positionTitle,
                managerId,
            } as any
        });

        const hashedPassword = await bcrypt.hash("123456", 10);
        await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`,
                role: "EMPLOYEE",
                employeeId: employee.id
            }
        });

        // Log history
        const session = await getSession();
        if (session?.user) {
            await db.history.create({
                data: {
                    action: "Added new faculty member",
                    details: `Added ${firstName} ${lastName} as ${positionTitle}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: employee.id,
                    targetName: `${firstName} ${lastName}`,
                    type: 'EMPLOYEE'
                }
            });
        }

        revalidatePath("/employees");
        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create employee" };
    }
}

export async function deleteEmployeeAction(id: string) {
    try {
        const emp = await db.employee.delete({ where: { id } });
        if (emp && emp.email) {
            await db.userAdmin.delete({ where: { email: emp.email } });
        }

        const session = await getSession();
        if (session?.user && emp) {
            await db.history.create({
                data: {
                    action: "Removed faculty member",
                    details: `Deleted employee ${emp.firstName} ${emp.lastName}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: emp.id,
                    targetName: `${emp.firstName} ${emp.lastName}`,
                    type: 'EMPLOYEE'
                }
            });
        }

        revalidatePath("/employees");
        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete employee" };
    }
}
