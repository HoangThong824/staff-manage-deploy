# System Architecture: Staff Management System

The Staff Management System currently employs a "Thick Client" or "Offline-First" architecture. This means the majority of the business logic, state management, and data persistence operations occur directly within the user's browser, rather than relying on a traditional backend server.

## 1. High-Level Architecture
The application is built on the Next.js App Router, but leans heavily on Client Components to interact with the browser's storage APIs.

- **View Layer (Next.js/React)**: Renders the user interface and handles user interactions.
- **State Management Layer (React Context)**: Acts as the central nervous system, holding the application's state in memory.
- **Storage Layer (LocalStorage)**: Acts as the persistent database, surviving page reloads and browser restarts.

## 2. Unidirectional Data Flow
The system strictly enforces a unidirectional data flow pattern to ensure state predictability and UI consistency.

1. **User Action**: The user interacts with the UI (e.g., submits a form, drags a Kanban card).
2. **Context Action Call**: The component calls a specifically defined action function from `useData()` (e.g., `updateTaskItemStatus`).
3. **State Mutation**: The action function in `DataContext.tsx` executes the business logic and constructs the new state object.
4. **Persistence & Sync**: The action calls `saveData(newState)`, which simultaneously:
   - Updates the internal mutable reference (`dataRef.current`) for immediate synchronous access.
   - Updates the React state (`setData`) to trigger a UI re-render.
   - Serializes and writes the state to `LocalStorage`.
5. **Re-render**: React reconciles the state changes and updates the DOM to reflect the new data.

## 3. Core Components

### `DataContext.tsx` (Virtual Backend)
This file is the most critical piece of the architecture. It serves as:
- **The Database Controller**: Handling all CRUD operations.
- **The Authentication Service**: Managing login states and hashing (simulated).
- **The Event Emitter**: Generating automated notifications via `useEffect` loops.

### The Kanban System (`TaskItemBoard.tsx`)
Built using `@dnd-kit/core`, this component complex drag-and-drop interactions. It manages local ephemeral state during the drag operation and defers to `DataContext` for the final state mutation upon drop completion (`handleDragEnd`).

### Notification Engine
A client-side daemon implemented as a `useEffect` hook in `DataContext`. It polls the task list every 60 seconds to check for impending due dates and generates in-app notifications if necessary.

## 4. Future Scalability Considerations
While LocalStorage is excellent for prototyping, it has limitations (5MB limit, tied to a single device). 
When scaling to a real backend (e.g., Node.js/PostgreSQL or Supabase), the architectural foundation is already set:
- The Action functions in `DataContext` currently return Promises (`async`). These can be easily swapped to perform `fetch` or `axios` calls to a REST API without changing the UI components consuming them.
- `DataContext` will transition from being the "database" to being a "data cache/store" (similar to React Query or Redux Thunk).
