# ADR 001: LocalStorage for Data Persistence

## Status
Accepted

## Date
2026-03-12

## Context
The Staff Management System requires a mechanism to persist structured relational data (Users, Employees, Tasks, Departments, etc.) across browser sessions. The project constraints dictate a rapid prototyping phase where setting up, authenticating, and maintaining a traditional backend database (e.g., PostgreSQL, MongoDB) introduces unnecessary overhead and complexity. The application must functional immediately upon loading without complex infrastructure dependencies.

## Decision
We will utilize the browser's native `LocalStorage` API as the primary persistent data store for the application. All application state will be serialized to JSON and stored under a single key (`staff_mng_db`), while session data will be stored under (`staff_session`).

To abstract the direct `localStorage` calls, we implemented a wrapper in `src/lib/localStorage.ts` containing safe `get`, `set`, and `remove` methods that handle JSON parsing and `window` object availability checks (crucial for Next.js SSR).

## Rationale
- **Zero Configuration**: LocalStorage requires no setup, API keys, or database migrations, radically accelerating the development loop.
- **Performance**: Data retrieval and mutation are near-instantaneous, providing an exceptionally snappy user experience.
- **Offline Capability**: The application can function entirely offline as all data resides on the client device.
- **Prototyping Focus**: It allows developers and stakeholders to focus entirely on the UI/UX and business logic flows before committing to a backend architecture.

## Consequences

### Positive
- Extremely fast development iteration and deployment.
- No backend hosting costs or complexity.
- Simplified state management as the "database" is just a synchronous JavaScript object.

### Negative
- **Storage Limits**: LocalStorage is typically limited to 5MB, which restricts the amount of historical data or complex entities we can store.
- **No Remote Sync**: Data is strictly tied to the specific device and browser where the application is accessed. A user cannot log in on their phone and see the data they created on their laptop.
- **Security**: Data in LocalStorage is easily accessible via the browser's DevTools, making it unsuitable for highly sensitive or production-ready personnel data without encryption.
- **Data Integrity**: Manual manipulation of the LocalStorage JSON by a knowledgeable user could break the application state.

## Alternatives Considered
- **IndexedDB**: More scalable than LocalStorage but significantly more complex to implement without third-party wrappers (like Dexie.js). Decided against it to keep dependencies low.
- **BaaS (Firebase/Supabase)**: Offers real backend features, but requires network requests, authentication setups, and external state management. Deferred to a future implementation phase.
