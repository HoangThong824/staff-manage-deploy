"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Database, User, Employee, Task, TaskItem, Department, Position, Notification, HistoryEntry } from '@/lib/db';
import { storage } from '@/lib/localStorage';

interface DataContextType {
    data: Database;
    loading: boolean;
    session: any;

    // User actions
    findUserByEmail: (email: string) => Promise<User | null>;
    createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'> & { role?: string }) => Promise<User>;
    updateUser: (id: string, data: Partial<User>) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;

    // Employee actions
    getEmployees: () => Promise<(Employee & { positionName: string, departmentName: string })[]>;
    createEmployee: (data: any) => Promise<Employee>;
    deleteEmployee: (id: string) => Promise<Employee>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<Employee>;
    getSubordinates: (managerId: string, recursive?: boolean) => Promise<any[]>;

    // Department actions
    getDepartments: () => Promise<Department[]>;
    createDepartment: (name: string) => Promise<Department>;
    updateDepartment: (id: string, name: string) => Promise<Department>;
    deleteDepartment: (id: string) => Promise<Department>;

    // Position actions
    getPositions: (where?: { departmentId?: string }) => Promise<Position[]>;
    createPosition: (data: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Position>;
    updatePosition: (id: string, data: Partial<Position>) => Promise<Position>;
    deletePosition: (id: string) => Promise<Position>;

    // Task actions
    getTasks: (where?: { employeeId?: string, assignedBy?: string }) => Promise<Task[]>;
    getTask: (id: string) => Promise<any>;
    getTaskItems: (taskId: string) => Promise<TaskItem[]>;
    createTaskItem: (taskId: string, title: string) => Promise<TaskItem>;
    updateTaskItemStatus: (itemId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED") => Promise<TaskItem>;
    deleteTaskItem: (itemId: string) => Promise<TaskItem>;
    createTask: (data: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
    updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
    deleteTask: (id: string) => Promise<Task>;
    addMemberToTask: (taskId: string, employeeId: string) => Promise<void>;
    removeMemberFromTask: (taskId: string, employeeId: string) => Promise<void>;

    // History actions
    getHistory: () => Promise<HistoryEntry[]>;
    createHistory: (data: Omit<HistoryEntry, 'id' | 'createdAt'>) => Promise<HistoryEntry>;

    // Notification actions
    getNotifications: (where?: { userId?: string, isRead?: boolean }) => Promise<Notification[]>;
    createNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<Notification>;
    markNotificationRead: (id: string) => Promise<void>;
    markNotificationsRead: (userId: string) => Promise<void>;

    // Auth actions
    login: (credentials: any) => Promise<any>;
    logout: () => void;
    changePassword: (data: any) => Promise<{ success?: string, error?: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'staff_mng_db';
const SEED_VERSION_KEY = 'staff_mng_seed_v';
const CURRENT_SEED_VERSION = '5'; // bump this when defaultSeed changes

const initialDb: Database = {
    departments: [],
    positions: [],
    employees: [],
    users: [],
    tasks: [],
    taskItems: [],
    notifications: [],
    history: []
};

const defaultSeed: Database = {
    "departments": [
        { "id": "wm0rhrpxz8qcyepdvpfmdb", "name": "Development", "createdAt": "2026-03-06T02:06:32.439Z", "updatedAt": "2026-03-06T02:06:32.440Z" },
        { "id": "gk4eqa7y5e4ygvwt7su1r", "name": "Research", "createdAt": "2026-03-06T02:08:06.850Z", "updatedAt": "2026-03-06T02:08:06.850Z" }
    ],
    "positions": [
        { "id": "z5tt9kp911l10u51yohmq", "title": "Intern", "departmentId": "dept-1", "salaryMin": null, "salaryMax": null, "createdAt": "2026-03-04T02:11:47.196Z", "updatedAt": "2026-03-04T02:11:47.196Z" },
        { "id": "f3iubhn196ew8ddscwwv0a", "title": "HR", "departmentId": "dept-1", "salaryMin": null, "salaryMax": null, "createdAt": "2026-03-04T02:33:14.239Z", "updatedAt": "2026-03-04T02:33:14.239Z" },
        { "id": "udwzoyvslr88xc6dfhn0jb", "title": "DA", "departmentId": "dept-1", "salaryMin": null, "salaryMax": null, "createdAt": "2026-03-04T02:44:06.185Z", "updatedAt": "2026-03-04T02:44:06.185Z" }
    ],
    "employees": [
        { "id": "to5nfeaze12rc0fdodbkm", "employeeId": "EMP002", "firstName": "Nguyen", "lastName": "A", "email": "a@gmai.com", "phone": null, "address": null, "birthDate": null, "joinDate": "2026-03-04T02:33:14.239Z", "status": "ACTIVE", "departmentId": "dept-1", "positionId": "f3iubhn196ew8ddscwwv0a", "createdAt": "2026-03-04T02:33:14.239Z", "updatedAt": "2026-03-04T02:33:14.239Z" },
        { "id": "z97cuskfvomiin1b6kjbl", "employeeId": "EMP003", "firstName": "Nguyen", "lastName": "B", "email": "b@gmai.com", "phone": null, "address": null, "birthDate": null, "joinDate": "2026-03-04T02:44:06.185Z", "status": "ACTIVE", "departmentId": "dept-1", "positionId": "udwzoyvslr88xc6dfhn0jb", "createdAt": "2026-03-04T02:44:06.185Z", "updatedAt": "2026-03-04T02:44:06.185Z" },
        { "id": "jxie467tn3rk0tvvteod8", "employeeId": "EMP004", "firstName": "Nguyen", "lastName": "C", "email": "c@gmail.com", "phone": null, "address": null, "birthDate": null, "joinDate": "2026-03-05T06:56:44.344Z", "status": "ACTIVE", "departmentId": "dept-1", "positionId": "z5tt9kp911l10u51yohmq", "managerId": "to5nfeaze12rc0fdodbkm", "createdAt": "2026-03-05T06:56:44.344Z", "updatedAt": "2026-03-05T06:56:44.344Z" }
    ],
    "users": [
        { "id": "gqj40e7ewegx6o49kziuh", "email": "admin@admin.com", "name": "System Admin", "password": "admin123", "role": "ADMIN", "employeeId": "admin-emp-001", "createdAt": "2026-03-04T01:47:45.230Z", "updatedAt": "2026-03-04T01:47:45.230Z" },
        { "id": "user-a-id", "email": "a@gmail.com", "password": "123", "name": "Nguyen A", "role": "EMPLOYEE", "employeeId": "to5nfeaze12rc0fdodbkm", "createdAt": "2026-03-04T02:33:14.444Z", "updatedAt": "2026-03-04T03:52:16.251Z" },
        { "id": "user-b-id", "email": "b@gmail.com", "password": "123", "name": "Nguyen B", "role": "EMPLOYEE", "employeeId": "z97cuskfvomiin1b6kjbl", "createdAt": "2026-03-04T02:33:14.444Z", "updatedAt": "2026-03-04T03:52:16.251Z" },
        { "id": "user-c-id", "email": "c@gmail.com", "password": "123", "name": "Nguyen C", "role": "EMPLOYEE", "employeeId": "jxie467tn3rk0tvvteod8", "createdAt": "2026-03-04T02:33:14.444Z", "updatedAt": "2026-03-04T03:52:16.251Z" }
    ],
    "tasks": [],
    "taskItems": [],
    "notifications": [],
    "history": []
};

export function DataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<Database>(initialDb);
    const dataRef = React.useRef<Database>(initialDb);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        // Check seed version — if outdated, reset to new seed
        const savedVersion = storage.get<string>(SEED_VERSION_KEY);
        if (savedVersion !== CURRENT_SEED_VERSION) {
            storage.set(STORAGE_KEY, defaultSeed);
            storage.set(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
            storage.remove('staff_session');
            setData(defaultSeed); dataRef.current = defaultSeed;
            setLoading(false);
            return;
        }

        const saved = storage.get<Database>(STORAGE_KEY);
        if (saved) {
            setData(saved); dataRef.current = saved;
        } else {
            setData(defaultSeed); dataRef.current = defaultSeed;
            storage.set(STORAGE_KEY, defaultSeed);
        }

        const savedSession = storage.get('staff_session');
        if (savedSession) setSession(savedSession);

        setLoading(false);
    }, []);

    const saveData = (newData: Database) => {
        dataRef.current = newData;
        setData(newData);
        storage.set(STORAGE_KEY, newData);
    };

    const generateId = () => Math.random().toString(36).substring(2, 15);

    const findUserByEmail = async (email: string) => {
        return dataRef.current.users.find(u => u.email === email) || null;
    };

    const createUser = async (args: any) => {
        const newUser: User = {
            ...args,
            id: generateId(),
            role: args.role || 'USER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, users: [...dataRef.current.users, newUser] });
        return newUser;
    };

    const updateUser = async (id: string, updates: Partial<User>) => {
        const updatedUsers = dataRef.current.users.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u);
        saveData({ ...dataRef.current, users: updatedUsers });

        const updatedUser = updatedUsers.find(u => u.id === id)!;

        // If updated user is the current session user, sync the session state too
        if (session && session.user.id === id) {
            const newSession = {
                ...session,
                user: {
                    ...session.user,
                    name: updatedUser.name || session.user.name,
                    email: updatedUser.email || session.user.email,
                }
            };
            setSession(newSession);
            storage.set('staff_session', newSession);
        }

        return updatedUser;
    };

    const deleteUser = async (id: string) => {
        saveData({ ...dataRef.current, users: dataRef.current.users.filter(u => u.id !== id) });
    };

    const getEmployees = async () => {
        return dataRef.current.employees.map(emp => {
            const pos = dataRef.current.positions.find(p => p.id === emp.positionId);
            const dept = dataRef.current.departments.find(d => d.id === emp.departmentId);
            return {
                ...emp,
                positionName: pos ? pos.title : 'Unknown',
                departmentName: dept ? dept.name : 'General'
            };
        });
    };

    const createEmployee = async (args: any) => {
        const newEmp: Employee = {
            ...args,
            id: generateId(),
            employeeId: `EMP${String(dataRef.current.employees.length + 1).padStart(3, '0')}`,
            joinDate: new Date().toISOString(),
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, employees: [...dataRef.current.employees, newEmp] });
        return newEmp;
    };

    const deleteEmployee = async (id: string) => {
        const deleted = dataRef.current.employees.find(e => e.id === id)!;
        saveData({ ...dataRef.current, employees: dataRef.current.employees.filter(e => e.id !== id) });
        return deleted;
    };

    const updateEmployee = async (id: string, updates: Partial<Employee>) => {
        const updatedEmployees = dataRef.current.employees.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e);
        saveData({ ...dataRef.current, employees: updatedEmployees });
        return updatedEmployees.find(e => e.id === id)!;
    };

    const getSubordinates = async (managerId: string, recursive: boolean = true) => {
        const getDirect = (mId: string) => dataRef.current.employees.filter(e => e.managerId === mId);
        if (!recursive) return getDirect(managerId);

        let all: Employee[] = [];
        const queue = [managerId];
        const seen = new Set<string>();
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (seen.has(current)) continue;
            seen.add(current);
            const direct = getDirect(current);
            all.push(...direct);
            queue.push(...direct.map(d => d.id));
        }
        return all;
    };

    const getDepartments = async () => dataRef.current.departments;
    const createDepartment = async (name: string) => {
        const newDept: Department = {
            id: generateId(),
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, departments: [...dataRef.current.departments, newDept] });
        return newDept;
    };
    const updateDepartment = async (id: string, name: string) => {
        const updated = dataRef.current.departments.map(d => d.id === id ? { ...d, name, updatedAt: new Date().toISOString() } : d);
        saveData({ ...dataRef.current, departments: updated });
        return updated.find(d => d.id === id)!;
    };
    const deleteDepartment = async (id: string) => {
        const deleted = dataRef.current.departments.find(d => d.id === id)!;
        saveData({
            ...dataRef.current,
            departments: dataRef.current.departments.filter(d => d.id !== id),
            positions: dataRef.current.positions.filter(p => p.departmentId !== id),
            employees: dataRef.current.employees.map(e => e.departmentId === id ? { ...e, departmentId: 'none' } : e)
        });
        return deleted;
    };

    const getPositions = async (where?: { departmentId?: string }) => {
        let p = dataRef.current.positions;
        if (where?.departmentId) p = p.filter(x => x.departmentId === where.departmentId);
        return p.map(pos => {
            const dept = dataRef.current.departments.find(d => d.id === pos.departmentId);
            return {
                ...pos,
                departmentName: dept ? dept.name : "Unknown"
            };
        }) as any;
    };

    const createPosition = async (args: any) => {
        const newPos: Position = {
            ...args,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, positions: [...dataRef.current.positions, newPos] });
        return newPos;
    };
    const updatePosition = async (id: string, updates: Partial<Position>) => {
        const updated = dataRef.current.positions.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
        saveData({ ...dataRef.current, positions: updated });
        return updated.find(p => p.id === id)!;
    };
    const deletePosition = async (id: string) => {
        const hasEmployees = dataRef.current.employees.some(e => e.positionId === id);
        if (hasEmployees) throw new Error("Cannot delete position with associated employees");
        const deleted = dataRef.current.positions.find(p => p.id === id)!;
        saveData({ ...dataRef.current, positions: dataRef.current.positions.filter(p => p.id !== id) });
        return deleted;
    };

    const getTasks = async (where?: { employeeId?: string, assignedBy?: string }) => {
        let p = dataRef.current.tasks;
        const empId = where?.employeeId;
        if (empId) p = p.filter(x => x.employeeIds.includes(empId));
        if (where?.assignedBy) p = p.filter(x => x.assignedBy === where.assignedBy);
        return p;
    };

    const getTask = async (id: string) => {
        const t = dataRef.current.tasks.find(x => x.id === id);
        if (!t) return null;
        const participants = dataRef.current.employees
            .filter(e => t.employeeIds.includes(e.id))
            .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}`, email: e.email }));
        const assigner = dataRef.current.users.find(u => u.id === t.assignedBy);
        return {
            ...t,
            participants,
            assignerName: assigner?.name || assigner?.email || "Unknown"
        };
    };

    const createTask = async (args: any) => {
        const newTask: Task = {
            ...args,
            id: generateId(),
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, tasks: [...dataRef.current.tasks, newTask] });
        return newTask;
    };

    const updateTask = async (id: string, args: any) => {
        const updated = dataRef.current.tasks.map(t => t.id === id ? { ...t, ...args, updatedAt: new Date().toISOString() } : t);
        saveData({ ...dataRef.current, tasks: updated });
        return updated.find(t => t.id === id)!;
    };

    const addMemberToTask = async (taskId: string, employeeId: string) => {
        const task = dataRef.current.tasks.find(t => t.id === taskId);
        if (!task) return;
        if (task.employeeIds.includes(employeeId)) return;
        const updated = dataRef.current.tasks.map(t => t.id === taskId ? { ...t, employeeIds: [...t.employeeIds, employeeId], updatedAt: new Date().toISOString() } : t);
        saveData({ ...dataRef.current, tasks: updated });
    };

    const removeMemberFromTask = async (taskId: string, employeeId: string) => {
        const updated = dataRef.current.tasks.map(t => t.id === taskId ? { ...t, employeeIds: t.employeeIds.filter(id => id !== employeeId), updatedAt: new Date().toISOString() } : t);
        saveData({ ...dataRef.current, tasks: updated });
    };

    const deleteTask = async (id: string) => {
        const deleted = dataRef.current.tasks.find(t => t.id === id)!;
        saveData({
            ...dataRef.current,
            tasks: dataRef.current.tasks.filter(t => t.id !== id),
            taskItems: dataRef.current.taskItems.filter(ti => ti.taskId === id)
        });
        return deleted;
    };

    const getTaskItems = async (taskId: string) => {
        return dataRef.current.taskItems.filter(ti => ti.taskId === taskId);
    };

    const createTaskItem = async (taskId: string, title: string) => {
        const newItem: TaskItem = {
            id: generateId(),
            taskId,
            title,
            status: 'PENDING',
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, taskItems: [...dataRef.current.taskItems, newItem] });
        return newItem;
    };

    const updateTaskItemStatus = async (itemId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED") => {
        const updated = dataRef.current.taskItems.map(ti => ti.id === itemId ? { ...ti, status, updatedAt: new Date().toISOString() } : ti);
        saveData({ ...dataRef.current, taskItems: updated });
        return updated.find(ti => ti.id === itemId)!;
    };

    const deleteTaskItem = async (itemId: string) => {
        const deleted = dataRef.current.taskItems.find(ti => ti.id === itemId)!;
        saveData({ ...dataRef.current, taskItems: dataRef.current.taskItems.filter(ti => ti.id !== itemId) });
        return deleted;
    };

    const getHistory = async () => [...dataRef.current.history].reverse();
    const createHistory = async (args: any) => {
        const entry: HistoryEntry = { ...args, id: generateId(), createdAt: new Date().toISOString() };
        saveData({ ...dataRef.current, history: [...dataRef.current.history, entry] });
        return entry;
    };

    const getNotifications = async (where?: { userId?: string, isRead?: boolean }) => {
        let n = dataRef.current.notifications;
        if (where?.userId) n = n.filter(x => x.userId === where.userId);
        if (where?.isRead !== undefined) n = n.filter(x => x.isRead === where.isRead);
        return [...n].reverse();
    };

    const createNotification = async (args: any) => {
        const entry: Notification = {
            ...args,
            id: generateId(),
            isRead: false,
            createdAt: new Date().toISOString()
        };
        saveData({ ...dataRef.current, notifications: [...dataRef.current.notifications, entry] });
        return entry;
    };

    const markNotificationRead = async (id: string) => {
        const updated = dataRef.current.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        saveData({ ...dataRef.current, notifications: updated });
    };

    const markNotificationsRead = async (userId: string) => {
        const updated = dataRef.current.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n);
        saveData({ ...dataRef.current, notifications: updated });
    };

    const login = async (credentials: any) => {
        let { email, password } = credentials;
        if (!email || !password) return { error: "Email and password are required" };

        email = email.trim().toLowerCase();

        const user = dataRef.current.users.find(u => (u.email || '').trim().toLowerCase() === email);
        if (!user) return { error: "Invalid email or password" };

        if (password !== user.password) return { error: "Invalid email or password" };

        const sessionData = { user: { id: user.id, email: user.email, name: user.name, role: user.role, employeeId: user.employeeId } };
        setSession(sessionData);
        storage.set('staff_session', sessionData);
        return { success: true };
    };

    const logout = () => {
        setSession(null);
        storage.remove('staff_session');
    };

    const changePassword = async (args: any) => {
        const { currentPassword, newPassword, confirmPassword } = args;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return { error: "All fields are required" };
        }
        if (newPassword !== confirmPassword) {
            return { error: "New passwords do not match" };
        }
        if (!session) return { error: "Not authenticated" };

        const user = dataRef.current.users.find(u => u.email === session.user.email);
        if (!user) return { error: "User not found" };

        if (currentPassword !== user.password) return { error: "Current password is incorrect" };

        const updatedUsers = dataRef.current.users.map(u => u.id === user.id ? { ...u, password: newPassword, updatedAt: new Date().toISOString() } : u);
        saveData({ ...dataRef.current, users: updatedUsers });

        await createHistory({
            userId: user.id,
            userName: user.name || user.email,
            type: "AUTH",
            action: "UPDATE_PASSWORD",
            details: "User changed their password",
            targetId: user.id
        });

        return { success: "Password updated successfully" };
    };

    return (
        <DataContext.Provider value={{
            data, loading, session,
            findUserByEmail, createUser, updateUser, deleteUser,
            getEmployees, createEmployee, updateEmployee, deleteEmployee, getSubordinates,
            getDepartments, createDepartment, updateDepartment, deleteDepartment,
            getPositions, createPosition, updatePosition, deletePosition,
            getTasks, getTask, getTaskItems, createTaskItem, updateTaskItemStatus, deleteTaskItem, createTask, updateTask, deleteTask,
            addMemberToTask, removeMemberFromTask,
            getHistory, createHistory,
            getNotifications, createNotification, markNotificationRead, markNotificationsRead,
            login, logout, changePassword
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
