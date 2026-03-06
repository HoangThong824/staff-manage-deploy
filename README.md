# StaffMNG – Staff Management System

**StaffMNG** is a modern HR management web application built with **Next.js 16**, using a **JSON file** as the database for a lightweight, easy-to-deploy setup.

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## System Overview

### Features

- **Staff management**: Employees, departments, positions, org tree.
- **Collaborative tasks**: Assign tasks to one or more employees; manage participants.
- **Trello-style task board**: Drag-and-drop tasks between **To Do**, **In Progress**, and **Completed** (list/board view toggle).
- **Task detail & management**: Open a task to edit title/description/due date, update status, manage participants, and delete.
- **Task items (sub-tasks)**: Inside each task, add items and drag them between **To Do**, **In Progress**, and **Done**.
- **Notifications**: In-app notifications for task assignment and completion.
- **Activity history**: Log of important actions (Admin).
- **Role-based access**: Admin, Employee (including managers with subordinates).

### Tech Stack

| Layer      | Technology                                                                 |
|-----------|-----------------------------------------------------------------------------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions)                 |
| Language  | TypeScript                                                                  |
| Database  | JSON file (`data/db.json`)                                                 |
| Auth      | JWT (jose) + bcryptjs                                                      |
| UI        | Tailwind CSS, Lucide Icons, Framer Motion                                  |
| Drag & drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities                    |

---

## Architecture

```mermaid
graph TD
    subgraph Client["Client (Browser)"]
        UI["React Components"]
        Sidebar["Sidebar Navigation"]
        TopNav["TopNav + NotificationBell"]
    end

    subgraph Server["Next.js Server"]
        MW["Middleware (JWT)"]
        Pages["Server Pages (RSC)"]
        SA["Server Actions"]
        Auth["Auth (JWT)"]
    end

    subgraph Data["Data Layer"]
        DB["db.ts (Prisma-like API)"]
        JSON["data/db.json"]
    end

    UI -->|Form / Action Call| SA
    UI -->|HTTP| MW
    MW -->|Valid Session| Pages
    MW -->|No Session| Login["Redirect /login"]
    Pages -->|Read| DB
    SA -->|Read/Write| DB
    SA -->|Session Check| Auth
    DB -->|fs read/write| JSON
    Auth -->|Cookie (JWT)| UI
```

---

## Data Model

The app uses **8 collections** in `data/db.json`:

| Collection    | Description |
|---------------|-------------|
| departments   | Departments |
| positions     | Job positions (linked to departments) |
| employees     | Staff records (manager hierarchy, department, position) |
| users         | Login accounts (ADMIN / EMPLOYEE, optional link to employee) |
| tasks         | Collaborative tasks (title, description, status, assignee list, due date) |
| taskItems     | Sub-items per task (title, status: To Do / In Progress / Done), for in-task drag-and-drop |
| notifications | In-app notifications (e.g. task assigned, task completed) |
| history       | Activity log entries |

### Task & TaskItem

- **Task**: `status` = PENDING \| IN_PROGRESS \| COMPLETED. Shown on the main **Tasks** page in a board or list; drag-and-drop moves tasks between columns.
- **TaskItem**: Belongs to one task; `status` = PENDING \| IN_PROGRESS \| COMPLETED. Managed on the **task detail** page (`/tasks/[taskId]`) with its own three-column board (To Do / In Progress / Done). Members can add items and drag them between columns.

---

## Permissions (Roles)

| Feature              | ADMIN | EMPLOYEE (Manager) | EMPLOYEE |
|----------------------|:-----:|:------------------:|:--------:|
| Dashboard            | Yes   | Yes (personal)     | Yes      |
| View all tasks       | Yes   | No                 | No       |
| View own/team tasks  | Yes   | Yes                | Yes      |
| Create task          | Yes (any) | Yes (subordinates) | No   |
| Edit/delete task     | Yes   | Yes (if assigner/manager) | No |
| Task items (add/move/delete) | Yes | Yes (if can access task) | Yes (if participant) |
| Employees management | Yes   | No                 | No       |
| My Team              | Yes   | Yes                | Yes      |
| Activity history     | Yes   | No                 | No       |

---

## Main Flows

### Authentication

1. User logs in via `loginAction`.
2. Credentials are checked against `db.json`.
3. On success, a JWT is created and stored in the `session` cookie.
4. Middleware protects routes and redirects to `/login` when there is no valid session.

### Tasks

1. **Tasks page** (`/tasks`): Board or list of tasks; drag-and-drop to change status; link to task detail.
2. **Task detail** (`/tasks/[taskId]`): View/edit task, update status, manage participants, and manage **task items** (sub-tasks) with drag-and-drop between To Do / In Progress / Done.
3. **Manage by employee** (`/tasks/manage/[id]`): All tasks for one employee; assign new tasks and manage participants.

---

## Project Structure

- `src/app/` – Pages (Dashboard, Tasks, Task detail, Employees, History, Profile, etc.).
- `src/actions/` – Server Actions (auth, task, taskItem, employee, department, etc.).
- `src/components/` – Reusable UI (layout, admin, employee, **tasks** including board/list/item board).
- `src/lib/` – Data layer (`db.ts`), auth/session helpers.
- `data/db.json` – JSON database file.

---

## Highlights

1. **JSON persistence**: No separate database server; data stored in a single file.
2. **Role-based access**: Clear separation between Admin, managers, and employees.
3. **Collaborative tasks**: Multiple assignees per task; participant management.
4. **Trello-like UX**: Task board and list view; in-task item board with drag-and-drop.
5. **Activity logging**: Important changes recorded in history (Admin).
6. **Server-driven updates**: Server Actions and `revalidatePath` keep the UI in sync.

---

## Limitations & Roadmap

### Not yet implemented (UI placeholder)

- **Attendance**: Menu exists; no check-in/check-out flow.
- **Leave requests**: No request/approval flow.
- **Departments & positions**: Managed in code/db; no full CRUD UI for Admin.

### Possible improvements

- **Search**: Global search in TopNav (UI only so far).
- **Profile edit**: User-editable phone, address, avatar.
- **Password recovery**: Forgot-password flow (e.g. via email).
- **Database**: Move from JSON to PostgreSQL or MongoDB for concurrency and scale.
- **Security**: Move JWT secret to environment variables; add input validation (e.g. Zod).
- **Testing**: Add unit and E2E tests.

---

## Scripts

| Command       | Description           |
|--------------|-----------------------|
| `npm run dev`   | Start dev server      |
| `npm run build` | Production build      |
| `npm run start` | Run production server |
| `npm run lint`  | Run ESLint            |
