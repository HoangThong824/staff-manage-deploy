# StaffMNG – Staff Management System

A modern HR management web application built with **Next.js 16**, using a **JSON file** as the database. Supports staff management, collaborative tasks, task items (sub-tasks) with drag-and-drop inside each task, and role-based permissions. **Only the person who created a task (or an Admin) can mark it as completed.**

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** / yarn / pnpm

### Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command          | Description              |
|------------------|--------------------------|
| `npm run dev`    | Start development server |
| `npm run build`  | Production build         |
| `npm run start`  | Run production server    |
| `npm run lint`   | Run ESLint               |

---

## Features

- **Staff management**: Employees, departments, positions, organization tree.
- **Collaborative tasks**: Create tasks and assign them to one or more employees; manage participants.
- **Task list**: Main **Tasks** page shows a **list** of tasks (no drag-and-drop on this page). Open a task to manage it.
- **Task detail**: View/edit a task (title, description, due date), update status (Pending / In Progress), manage participants, delete. **Only the task creator or Admin can set status to Completed.**
- **Task items (sub-tasks)**: Inside each task, add items and **drag-and-drop** them between **To Do**, **In Progress**, and **Done** (three-column board).
- **Notifications**: In-app notifications for task assignment and task completion.
- **Activity history**: Log of important actions (Admin only).
- **Role-based access**: Admin, Employee, and managers (employees with subordinates).

---

## Tech Stack

| Layer       | Technology                                                |
|------------|------------------------------------------------------------|
| Framework  | Next.js 16 (App Router, Server Components, Server Actions)|
| Language   | TypeScript                                                |
| Database   | JSON file (`data/db.json`)                                |
| Auth       | JWT (jose) + bcryptjs                                     |
| UI         | Tailwind CSS 4, Lucide Icons, Framer Motion               |
| Drag & drop| @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities      |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Client (Browser)                                                │
│  React components, Sidebar, TopNav, NotificationBell             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Server                                                 │
│  Middleware (JWT) → Pages (RSC) / Server Actions → Auth         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data layer                                                     │
│  db.ts (Prisma-like API) → data/db.json                         │
└─────────────────────────────────────────────────────────────────┘
```

- **Middleware** protects routes and redirects unauthenticated users to `/login`.
- **Server Actions** handle mutations (create/update/delete) and enforce permissions.
- **Session** is stored in a JWT cookie.

---

## Data Model

The application uses **8 collections** in `data/db.json`:

| Collection    | Description |
|---------------|-------------|
| **departments** | Departments. |
| **positions**   | Job positions (linked to a department). |
| **employees**   | Staff records (manager hierarchy, department, position). |
| **users**       | Login accounts; role `ADMIN` or `EMPLOYEE`; optional link to an employee. |
| **tasks**       | Collaborative tasks: title, description, status (PENDING / IN_PROGRESS / COMPLETED), `employeeIds[]`, `assignedBy` (user id of creator), due date. |
| **taskItems**   | Sub-items of a task: title, status (PENDING / IN_PROGRESS / COMPLETED), order. Used for the in-task drag-and-drop board. |
| **notifications**| In-app messages (e.g. task assigned, task completed). |
| **history**     | Activity log entries (action, details, user, target). |

### Task vs TaskItem

- **Task**: The main assignment. Shown on `/tasks` as a list. Status can be updated via buttons or Edit form. **Only the user who created the task (`assignedBy`) or an Admin can set status to COMPLETED.**
- **TaskItem**: A sub-item inside one task. Managed on the task detail page (`/tasks/[taskId]`) in a three-column drag-and-drop board (To Do / In Progress / Done). Any user who can access the task can add, move, or delete task items.

---

## Permissions

| Feature                    | ADMIN | EMPLOYEE (Manager) | EMPLOYEE |
|---------------------------|:-----:|:------------------:|:--------:|
| Dashboard                 | ✅    | ✅ (personal)      | ✅       |
| View all tasks            | ✅    | ❌                 | ❌       |
| View own / team tasks     | ✅    | ✅                 | ✅       |
| Create task               | ✅ (any) | ✅ (subordinates) | ❌    |
| Edit / delete task        | ✅    | ✅ (if assigner/manager) | ❌ |
| **Mark task as completed**| ✅    | ✅ **Only if they created the task** | ❌ (or ✅ if they created it) |
| Task items (add/move/delete) | ✅  | ✅ (if can access task) | ✅ (if participant) |
| Employees / Depts / Positions | ✅ | ❌               | ❌       |
| My Team                   | ✅    | ✅                 | ✅       |
| Activity history          | ✅    | ❌                 | ❌       |

**Mark as completed**: Only the **task creator** (`assignedBy`) or an **Admin** can set a task’s status to **Completed**. Participants can set **Pending** or **In Progress** only. The UI disables the Completed button and hides the Completed option in the Edit form for users who are not allowed to complete the task; the server also returns an error if they try.

---

## Main Flows

### Authentication

1. User logs in via the login form (`loginAction`).
2. Credentials are checked against `users` in `db.json`.
3. On success, a JWT is created and stored in the `session` cookie.
4. Middleware validates the JWT on protected routes and redirects to `/login` when missing or invalid.

### Tasks

1. **Tasks page** (`/tasks`): List of tasks; link to task detail. No drag-and-drop here. Assign new tasks via “Assign Task” (Admin or manager).
2. **Task detail** (`/tasks/[taskId]`): View/edit task, update status (Completed only if creator or Admin), manage participants, and manage **task items** with drag-and-drop (To Do / In Progress / Done).
3. **Manage by employee** (`/tasks/manage/[id]`): All tasks for one employee; assign tasks and manage participants.

### Task completion

- **Update Status** buttons (Pending / In Progress / **Completed**): Only creator or Admin can use **Completed**; others see it disabled with an explanatory tooltip.
- **Edit Task** form: Status dropdown shows **Completed** only for creator or Admin; others see a message that only the task creator can mark it completed.
- **Server**: `updateTaskStatusAction` and `updateTaskAction` reject setting status to `COMPLETED` unless the current user is the task’s `assignedBy` or has role `ADMIN`.

---

## Project Structure

```
src/
├── app/                    # Routes (App Router)
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard
│   ├── login/
│   ├── tasks/               # Task list
│   │   ├── page.tsx
│   │   ├── [taskId]/       # Task detail + task items board
│   │   └── manage/[id]/    # Tasks by employee
│   ├── employees/
│   ├── departments/
│   ├── positions/
│   ├── my-team/
│   ├── history/
│   ├── profile/
│   └── settings/
├── actions/                # Server Actions
│   ├── task.ts             # getTasks, getTask, create, update, updateStatus, delete, task items
│   ├── employee.ts
│   ├── department.ts
│   ├── position.ts
│   ├── auth.ts
│   └── notification.ts
├── components/
│   ├── layout/             # Sidebar, TopNav, DashboardShell, NotificationBell
│   ├── admin/              # AssignTaskForm, EditTaskForm, DeleteTaskButton, TaskParticipantsManager, etc.
│   ├── employee/           # UpdateTaskStatusButton (with canComplete)
│   ├── tasks/              # TaskListView, TaskItemBoard, TaskItemColumn, TaskItemCard, AddTaskItemForm
│   └── auth/
└── lib/
    ├── db.ts               # JSON DB + Prisma-like API (tasks, taskItems, users, etc.)
    ├── auth/session.ts
    └── utils.ts

data/
└── db.json                 # Persistent JSON database
```

---

## Highlights

1. **JSON persistence**: No separate database server; all data in one file.
2. **Role-based access**: Clear separation between Admin, managers, and employees.
3. **Collaborative tasks**: Multiple participants per task; add/remove members.
4. **Completion rule**: Only the task creator or Admin can mark a task as completed; enforced in UI and server.
5. **In-task drag-and-drop**: Task items (sub-tasks) use a three-column board inside each task.
6. **Activity logging**: Important actions recorded in history (Admin view).
7. **Server-driven UI**: Server Actions and `revalidatePath` keep the UI in sync.

---

## Limitations & Roadmap

### Not implemented (placeholders)

- **Attendance**: Menu entry exists; no check-in/check-out flow.
- **Leave requests**: No request or approval flow.
- **Departments / Positions**: Stored in DB; no full CRUD UI for Admin.

### Possible improvements

- **Search**: Global search in TopNav (UI only).
- **Profile edit**: User-editable phone, address, avatar.
- **Password recovery**: e.g. forgot-password via email.
- **Database**: Move from JSON to PostgreSQL or MongoDB for concurrency and scale.
- **Security**: JWT secret and config in environment variables; input validation (e.g. Zod).
- **Tests**: Unit and E2E tests.

---

## License

Private project.
