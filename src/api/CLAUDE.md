# Context: `src/api`

## Purpose of this Module
The `src/api` directory is architecturally reserved to handle all external data communication. It serves as the bridge between the View/State layer and the external Backend/Database layer. 

## Current Implementation State
Presently, the Application is in a "Thick Client" prototyping phase. As documented in `ADR: 001`, `LocalStorage` is the primary data persistence layer. Therefore, the "API" logic is currently embedded within the `DataContext.tsx` File (the "Virtual Backend"). This directory is currently empty but structurally reserved for the transition to a real backend.

## Transitioning to a Real Backend (Future Roadmap)

When migrating the application from `LocalStorage` to a true backend service (e.g., a Next.js Server Actions backend, Node.js/Express, or Supabase), the following steps should be executed within this directory:

### 1. API Client Configuration (`src/api/client.ts`)
Establish a singleton Axios or Fetch instance here. This client should handle:
- Base URL configuration using Environment Variables.
- Default headers (e.g., `Content-Type: application/json`).
- Request Interceptors: Automatically attaching authentication JWT/Tokens to every outbound request.
- Response Interceptors: Global error handling (e.g., catching `401 Unauthorized` errors and automatically redirecting the user to `/login`).

### 2. Service Modules (e.g., `src/api/tasks.ts`)
Abstract the specific endpoint calls into modular service files.
Example structure:
```typescript
// src/api/tasks.ts
import { apiClient } from './client';
import { Task } from '@/lib/db';

export const getTasks = async (employeeId?: string): Promise<Task[]> => {
    const response = await apiClient.get('/api/tasks', { params: { employeeId } });
    return response.data;
};
```

### 3. Refactoring `DataContext.tsx`
Update the action functions within `DataContext.tsx` to call these new `src/api` service functions instead of touching `dataRef.current` and `saveData`. The Context will change from being the *source of truth* to a *local cache* of the remote server.
