# Context: `src/persistence`

## Purpose of this Module
The `src/persistence` (or functionally equivalent `src/lib/localStorage.ts`) directory encapsulates the logic required to read, write, and manage durable state.

## Core Mechanisms
The persistence layer relies on two critical files:

### 1. The Schema Definition (`src/lib/db.ts`)
This file defines the TypeScript interfaces representing the core entities of the application (`User`, `Employee`, `Task`, `TaskItem`, etc.). It acts as the contract that the data must adhere to, providing type safety across the application despite the underlying storage being schemaless JSON.

### 2. The Storage Utility (`src/lib/localStorage.ts`)
Since Next.js runs code on both the Server (SSR) and the Client (Browser), calls to the `window.localStorage` API are inherently unsafe during server-side renders (as the `window` object does not exist).
The `storage` object exported from this file provides safe wrappers:
- **`get<T>(key: string)`**: Checks for `window`, retrieves the string, parses the JSON, and safely catches any parsing errors, returning `null` on failure.
- **`set<T>(key: string, value: T)`**: Stringifies the payload and commits it to storage.

## Data Isolation & Keys
The entire dataset is serialized into a single JSON object under the key:
- `staff_mng_db`

Authentication state (used to hydrate the initial Context on reload) is stored separately under:
- `staff_session`

Seeding version control is tracked via:
- `staff_mng_seed_v`

## Persistence Best Practices
- **Do NOT bypass the Context**: UI components should never call `storage.set` directly. Doing so breaks the unidirectional data flow and causes the React State (UI) to desync from the Persistence Layer (LocalStorage).
- **Atomicity**: The `saveData` function in `DataContext.tsx` is responsible for updating the React State and calling `storage.set` synchronously. This is the only approved method for mutating the persistent data.
