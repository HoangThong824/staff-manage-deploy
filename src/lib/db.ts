
export interface Department {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Position {
    id: string;
    title: string;
    departmentId: string;
    salaryMin: number | null;
    salaryMax: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    birthDate: string | null;
    joinDate: string;
    status: string;
    departmentId: string;
    positionId: string;
    managerId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    password?: string;
    role: string;
    employeeId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    employeeIds: string[]; // List of participating employee IDs
    assignedBy: string; // admin user id
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TaskItem {
    id: string;
    taskId: string;
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    userId: string; // Recipient user id
    message: string;
    type: 'TASK_ASSIGNED' | 'TASK_COMPLETED';
    relatedId?: string; // e.g., taskId
    isRead: boolean;
    createdAt: string;
}

export interface HistoryEntry {
    id: string;
    action: string;
    details: string;
    userId: string; // The person who performed the action
    userName: string;
    targetId?: string;
    targetName?: string;
    type: 'EMPLOYEE' | 'TASK' | 'AUTH' | 'SYSTEM';
    createdAt: string;
}

export interface Database {
    departments: Department[];
    positions: Position[];
    employees: Employee[];
    users: User[];
    tasks: Task[];
    taskItems: TaskItem[];
    notifications: Notification[];
    history: HistoryEntry[];
}