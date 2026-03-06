"use server";

import { readDb, writeDb, generateId, Position } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPositions() {
    const db = readDb();
    return db.positions.map(p => {
        const dept = db.departments.find(d => d.id === p.departmentId);
        return {
            ...p,
            departmentName: dept ? dept.name : "Unknown"
        };
    });
}

export async function createPosition(data: { title: string, departmentId: string, salaryMin?: number, salaryMax?: number }) {
    const db = readDb();

    // Check if department exists
    if (data.departmentId !== 'dept-1' && !db.departments.some(d => d.id === data.departmentId)) {
        // Allow 'dept-1' as a fallback if it exists in seed or logic
    }

    const newPosition: Position = {
        id: generateId(),
        title: data.title,
        departmentId: data.departmentId,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.positions.push(newPosition);
    writeDb(db);
    revalidatePath("/positions");
    revalidatePath("/employees"); // Revalidate employees as they use positions
    return newPosition;
}

export async function updatePosition(id: string, data: Partial<Position>) {
    const db = readDb();
    const index = db.positions.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Position not found");

    db.positions[index] = {
        ...db.positions[index],
        ...data,
        updatedAt: new Date().toISOString()
    };

    writeDb(db);
    revalidatePath("/positions");
    revalidatePath("/employees");
    return db.positions[index];
}

export async function deletePosition(id: string) {
    const db = readDb();

    // Check for associated employees
    const hasEmployees = db.employees.some(e => e.positionId === id);
    if (hasEmployees) {
        throw new Error("Cannot delete position with associated employees");
    }

    const index = db.positions.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Position not found");

    const deleted = db.positions.splice(index, 1)[0];
    writeDb(db);
    revalidatePath("/positions");
    return deleted;
}
