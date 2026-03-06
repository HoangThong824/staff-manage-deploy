"use server";

import { readDb, writeDb, generateId, Department } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
    const db = readDb();
    return db.departments;
}

export async function createDepartment(data: { name: string }) {
    const db = readDb();

    const newDept: Department = {
        id: generateId(),
        name: data.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.departments.push(newDept);
    writeDb(db);
    revalidatePath("/departments");
    return newDept;
}

export async function updateDepartment(id: string, data: { name: string }) {
    const db = readDb();
    const index = db.departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Department not found");

    db.departments[index] = {
        ...db.departments[index],
        name: data.name,
        updatedAt: new Date().toISOString()
    };

    writeDb(db);
    revalidatePath("/departments");
    return db.departments[index];
}

export async function deleteDepartment(id: string) {
    const db = readDb();

    // Check for associated positions
    const hasPositions = db.positions.some(p => p.departmentId === id);
    if (hasPositions) {
        throw new Error("Cannot delete department with associated positions");
    }

    const index = db.departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Department not found");

    const deleted = db.departments.splice(index, 1)[0];
    writeDb(db);
    revalidatePath("/departments");
    return deleted;
}
