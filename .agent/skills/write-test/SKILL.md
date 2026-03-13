---
name: write-test
description: Testing DataContext, RBAC, and Kanban flows.
origin: ECC
---

# Write Test StaffMNG

Standardized patterns for unit and integration testing using Jest and React Testing Library in a client-side environment.

## Core Concepts

- **Context Mocking**: Since the app relies heavily on `DataContext`, testing requires mocked providers with realistic session/data payloads.
- **Role Simulation**: Test cases should explicitly simulate different user roles to verify RBAC gates.

## Code Examples

```typescript
// Mocking DataContext for RBAC test
jest.mock('@/context/DataContext', () => ({
  useData: () => ({
    session: { user: { role: 'EMPLOYEE' } },
    data: { tasks: [] }
  })
}));

test('Employee should not see delete button', () => {
  render(<TaskBoard />);
  expect(screen.queryByText(/Delete/i)).not.toBeInTheDocument();
});
```

## Best Practices

- **Guidelines**:
  - Use `screen.getByRole` for accessible selectors.
  - Clean up mocks between tests to prevent side effects.
- **Common Pitfalls**:
  - Testing internal state instead of user-visible resulting behavior.
  - Ignoring `async` wait periods when testing LocalStorage effects.

## When to Use

Required for all new features, bug fixes involving permissions, or when documenting core business logic behavior.
