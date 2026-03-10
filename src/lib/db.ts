/**
 * Department Entity: Represents an organizational unit (e.g., "Engineering").
 */
export interface Department {
    id: string; // Unique identifier (UUID-like)
    name: string; // Human-readable name
    createdAt: string; // ISO 8601 creation timestamp
    updatedAt: string; // ISO 8601 last modification timestamp
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

/**
 * Employee Entity: Core organizational member data.
 */
export interface Employee {
    id: string; // Unique internal ID
    employeeId: string; // Unique institutional ID (e.g., EMP001)
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    birthDate: string | null;
    joinDate: string; // Date of institutional joining
    status: string; // Operational status: ACTIVE, INACTIVE, etc.
    departmentId: string; // Foreign key to Department
    positionId: string; // Foreign key to Position
    managerId?: string | null; // Self-referential foreign key for hierarchy
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    /**
     * Optional avatar image stored as a data URL (base64) for client-only persistence.
     * Example: "data:image/png;base64,...."
     */
    avatarUrl?: string | null;
    password?: string;
    role: string;
    employeeId?: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Task Entity: Management unit for work assignment.
 */
export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; // Lifecycle state
    employeeIds: string[]; // Many-to-many relationship with Employees
    assignedBy: string; // Foregin key to User (the assigner)
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