---
name: write-test
description: Testing DataContext, RBAC, and Kanban flows.
---
# Skill: Write Test StaffMNG
## Environment
- **Framework**: Jest + React Testing Library.
- **Mocks**: 
  - Mock `useData` with `jest.mock`.
  - Provide realistic `session` and `data` (Users, Tasks).
- **Selectors**: Use `screen.getByRole` or `screen.getByText`.

## Test Cases
1. **Happy Path**: Successful CRUD/Sync.
2. **Security**: RBAC correctly blocks unauthorized roles.
3. **Storage**: Mock `localStorage` to verify persistence.
4. **Git**: Execute auto-commit after green tests.

## Result
Code block with tests + "Run: npm test"
