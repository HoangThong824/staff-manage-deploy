import fs from 'fs';
import path from 'path';

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
    employeeId: string;
    assignedBy: string; // admin user id
    dueDate: string | null;
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
    notifications: Notification[];
    history: HistoryEntry[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

// Initialize database file if it doesn't exist
const initializeDb = () => {
    if (!fs.existsSync(DB_FILE_PATH)) {
        const dir = path.dirname(DB_FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const initialData: Database = {
            departments: [],
            positions: [],
            employees: [],
            users: [],
            tasks: [],
            notifications: [],
            history: []
        };
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    }
};

export const readDb = (): Database => {
    initializeDb();
    try {
        const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(data) as Partial<Database>;
        return {
            departments: parsed.departments || [],
            positions: parsed.positions || [],
            employees: parsed.employees || [],
            users: parsed.users || [],
            tasks: parsed.tasks || [],
            notifications: parsed.notifications || [],
            history: parsed.history || []
        };
    } catch (error) {
        console.error('Failed to read database', error);
        return { departments: [], positions: [], employees: [], users: [], tasks: [], notifications: [], history: [] };
    }
};

export const writeDb = (data: Database): void => {
    initializeDb();
    try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to write database', error);
    }
};

export const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Prisma-like interface for seamless migration
export const db = {
    user: {
        findUnique: async (args: { where: { email: string } }) => {
            const data = readDb();
            return data.users.find(u => u.email === args.where.email) || null;
        },
        create: async (args: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'> & { role?: string } }) => {
            const data = readDb();
            if (data.users.some(u => u.email === args.data.email)) {
                const error = new Error("Unique constraint failed") as any;
                error.code = "P2002"; // Simulate Prisma 
                throw error;
            }

            const newUser: User = {
                ...args.data,
                role: args.data.role || 'USER',
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            data.users.push(newUser);
            writeDb(data);
            return newUser;
        },
        update: async (args: { where: { id: string }, data: Partial<User> }) => {
            const data = readDb();
            const index = data.users.findIndex(u => u.id === args.where.id);
            if (index === -1) throw new Error("User not found");

            data.users[index] = {
                ...data.users[index],
                ...args.data,
                updatedAt: new Date().toISOString()
            };
            writeDb(data);
            return data.users[index];
        }
    },
    employee: {
        findMany: async () => {
            const data = readDb();
            return data.employees.map(emp => {
                const pos = data.positions.find(p => p.id === emp.positionId);
                return { ...emp, positionName: pos ? pos.title : 'Unknown' };
            });
        },
        create: async (args: { data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'joinDate' | 'status' | 'employeeId' | 'departmentId' | 'phone' | 'address' | 'birthDate' | 'positionId'> & { positionTitle: string } }) => {
            const data = readDb();

            // Check email uniqueness
            if (data.employees.some(e => e.email === args.data.email)) {
                throw new Error("Email already exists");
            }

            // Find or create position
            let position = data.positions.find(p => p.title === args.data.positionTitle);
            if (!position) {
                position = {
                    id: generateId(),
                    title: args.data.positionTitle,
                    departmentId: 'dept-1', // Default department
                    salaryMin: null,
                    salaryMax: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                data.positions.push(position);
            }

            const newEmployee: Employee = {
                id: generateId(),
                employeeId: `EMP${String(data.employees.length + 1).padStart(3, '0')}`,
                firstName: args.data.firstName,
                lastName: args.data.lastName,
                email: args.data.email,
                phone: null,
                address: null,
                birthDate: null,
                joinDate: new Date().toISOString(),
                status: 'ACTIVE',
                departmentId: position.departmentId,
                positionId: position.id,
                managerId: (args.data as any).managerId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            data.employees.push(newEmployee);
            writeDb(data);
            return { ...newEmployee, positionName: position.title } as any;
        },
        getSubordinates: async (managerId: string, recursive: boolean = true) => {
            const data = readDb();
            const getDirect = (mId: string) => data.employees.filter(e => e.managerId === mId);

            let allSubordinates: Employee[] = [];
            if (!recursive) {
                allSubordinates = getDirect(managerId);
            } else {
                const queue = [managerId];
                const seen = new Set<string>();

                while (queue.length > 0) {
                    const currentId = queue.shift()!;
                    if (seen.has(currentId)) continue;
                    seen.add(currentId);

                    const direct = getDirect(currentId);
                    for (const sub of direct) {
                        if (!seen.has(sub.id)) {
                            allSubordinates.push(sub);
                            queue.push(sub.id);
                        }
                    }
                }
            }

            return allSubordinates.map(emp => {
                const pos = data.positions.find(p => p.id === emp.positionId);
                return { ...emp, positionName: pos ? pos.title : 'Unknown' };
            });
        },
        isSubordinate: async (managerId: string, employeeId: string) => {
            const data = readDb();
            let current = data.employees.find(e => e.id === employeeId);
            const seen = new Set<string>();

            while (current && current.managerId) {
                if (current.managerId === managerId) return true;
                if (seen.has(current.id)) break;
                seen.add(current.id);
                current = data.employees.find(e => e.id === current!.managerId);
            }
            return false;
        },
        delete: async (args: { where: { id: string } }) => {
            const data = readDb();
            const index = data.employees.findIndex(e => e.id === args.where.id);
            if (index === -1) throw new Error("Employee not found");
            const deleted = data.employees.splice(index, 1)[0];
            writeDb(data);
            return deleted;
        }
    },
    userAdmin: {
        delete: async (args: { where: { email: string } }) => {
            const data = readDb();
            const index = data.users.findIndex(u => u.email === args.where.email);
            if (index !== -1) {
                const deleted = data.users.splice(index, 1)[0];
                writeDb(data);
                return deleted;
            }
            return null;
        }
    },
    task: {
        findMany: async (args?: { where?: { employeeId?: string, assignedBy?: string } }) => {
            const data = readDb();
            let tasks = data.tasks;
            if (args?.where?.employeeId) {
                tasks = tasks.filter(t => t.employeeId === args.where!.employeeId);
            }
            if (args?.where?.assignedBy) {
                tasks = tasks.filter(t => t.assignedBy === args.where!.assignedBy);
            }
            return tasks.map(task => {
                const emp = data.employees.find(e => e.id === task.employeeId);
                return {
                    ...task,
                    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
                };
            });
        },
        create: async (args: { data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: Task['status'] } }) => {
            const data = readDb();
            const newTask: Task = {
                ...args.data,
                status: args.data.status || 'PENDING',
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            data.tasks.push(newTask);
            writeDb(data);
            return newTask;
        },
        update: async (args: { where: { id: string }, data: Partial<Task> }) => {
            const data = readDb();
            const index = data.tasks.findIndex(t => t.id === args.where.id);
            if (index === -1) throw new Error("Task not found");

            data.tasks[index] = {
                ...data.tasks[index],
                ...args.data,
                updatedAt: new Date().toISOString()
            };
            writeDb(data);
            return data.tasks[index];
        },
        delete: async (args: { where: { id: string } }) => {
            const data = readDb();
            const index = data.tasks.findIndex(t => t.id === args.where.id);
            if (index === -1) throw new Error("Task not found");
            const deleted = data.tasks.splice(index, 1)[0];
            writeDb(data);
            return deleted;
        }
    },
    notification: {
        findMany: async (args?: { where?: { userId?: string, isRead?: boolean } }) => {
            const data = readDb();
            let notifications = data.notifications;
            if (args?.where?.userId) {
                notifications = notifications.filter(n => n.userId === args.where!.userId);
            }
            if (args?.where?.isRead !== undefined) {
                notifications = notifications.filter(n => n.isRead === args.where!.isRead);
            }
            return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        create: async (args: { data: Omit<Notification, 'id' | 'createdAt' | 'isRead'> }) => {
            const data = readDb();
            const newNotification: Notification = {
                ...args.data,
                id: generateId(),
                isRead: false,
                createdAt: new Date().toISOString()
            };
            data.notifications.push(newNotification);
            writeDb(data);
            return newNotification;
        },
        update: async (args: { where: { id: string }, data: Partial<Notification> }) => {
            const data = readDb();
            const index = data.notifications.findIndex(n => n.id === args.where.id);
            if (index === -1) throw new Error("Notification not found");

            data.notifications[index] = {
                ...data.notifications[index],
                ...args.data
            };
            writeDb(data);
            return data.notifications[index];
        },
        markAllAsRead: async (userId: string) => {
            const data = readDb();
            data.notifications = data.notifications.map(n =>
                n.userId === userId ? { ...n, isRead: true } : n
            );
            writeDb(data);
            return true;
        }
    },
    history: {
        findMany: async () => {
            const data = readDb();
            return data.history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        create: async (args: { data: Omit<HistoryEntry, 'id' | 'createdAt'> }) => {
            const data = readDb();
            const newEntry: HistoryEntry = {
                ...args.data,
                id: generateId(),
                createdAt: new Date().toISOString()
            };
            data.history.push(newEntry);
            writeDb(data);
            return newEntry;
        }
    }
};

export default db;
