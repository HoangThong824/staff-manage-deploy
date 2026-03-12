# ADR 002: React Context API for Global State Management

## Status
Accepted

## Date
2026-03-12

## Context
As the application heavily relies on client-side data persistence (ADR 001), managing this data across deeply nested components (e.g., from the Sidebar navigation badges to individual Task Cards inside the Kanban board) requires a robust state management solution. Passing props down multiple levels ("prop drilling") is unmaintainable and leads to spaghetti code.

## Decision
We will use React's built-in **Context API** (`createContext`, `useContext`) paired with the `useState` and `useRef` hooks within a single, unified `DataProvider` defined in `src/context/DataContext.tsx`.

## Rationale
- **Native Implementation**: No external libraries (e.g., Redux, MobX, Zustand) are required, keeping the bundle size small and learning curve minimal.
- **Centralized Business Logic**: By encapsulating all CRUD operations, authentication, and notification logic within the Context Hook, UI components remain pure and focused solely on presentation.
- **Storage Synchronization**: Placing State and Storage updates adjacent to each other within the Context Action functions ensures that the React Virtual DOM and the browser's LocalStorage are always perfectly synchronized.

## Implementation Details
The `DataContext` exposes three primary state objects:
1. `data`: The reactive representation of the database (triggers re-renders).
2. `session`: The reactive representation of the current logged-in user.
3. `loading`: A boolean indicating if the initial load from LocalStorage is complete.

Furthermore, it exposes all executable actions (e.g., `getTasks`, `createEmployee`) which interact with both the state and `LocalStorage`. To avoid closure staleness issues where async functions might capture an old version of `data`, a mutable reference hook (`dataRef.current`) is utilized internally within the Context provider.

## Consequences

### Positive
- Clean, readable UI components that simply consume `useData()`.
- Centralized, easily testable business logic.
- Guaranteed consistency between UI state and durable storage.

### Negative
- **Performance bottlenecks**: Because the entire database object is held in a single Context `data` object, any minor update (e.g., toggling a task status) causes all components subscribed to `useData()` to re-render. For a small prototype, this is negligible. However, as the application grows, this will cause noticeable lag.
- **Lack of modularity**: A single monolithic file (`DataContext.tsx` is currently >800 lines) becomes difficult to navigate and maintain. 

## Mitigation Strategy
If re-rendering performance becomes an issue, we will need to split the monolithic `DataContext` into separate domain-specific contexts (e.g., `TaskContext`, `EmployeeContext`, `AuthContext`) or migrate to a more granular state manager like Zustand or Jotai.
