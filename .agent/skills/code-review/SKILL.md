---
name: code-review
description: Senior Review: LocalStorage, RBAC, dnd-kit, Tailwind 4.
origin: ECC
---

# Code Review StaffMNG

This skill provides a comprehensive audit checklist for StaffMNG, focusing on browser-side state security, role-based access control, and performance optimization.

## Core Concepts

- **State Security**: Enforce `DataContext` as the exclusive conduit for state changes. Direct `localStorage` mutations bypass reactivity and history logging.
- **RBAC Enforcement**: UI must reflect user permission levels (ADMIN/MANAGER/EMPLOYEE). Action buttons and destructive forms must be gated.
- **Interactive Integrity**: Ensuring `@dnd-kit` implementations follow strict hierarchy and use `DragOverlay` for accessible fluid interactions.

## Code Examples

```typescript
// Good: RBAC gating in components
const { session } = useData();
const isAdmin = session?.user?.role === 'ADMIN';

return (
  <div>
    {isAdmin && <DeleteButton onClick={handleDelete} />}
    <p>Always visible content</p>
  </div>
);

// Good: Using DataContext actions instead of direct storage
const { updateTask } = useData();
const handleStatusChange = async (newStatus) => {
  await updateTask(taskId, { status: newStatus });
};
```

## Best Practices

- **Actionable Guidelines**:
  - Always verify `"use client"` directive for hook-heavy components.
  - Check for `useMemo` on derived lists transformed from context data.
  - Ensure `cn()` is used for class merging and Tailwind 4 utility standard.
- **Do's and Don'ts**:
  - **Do**: Use `session.user.role` for all UI gates.
  - **Don't**: Rely on `localStorage.setItem` for application data.
- **Common Pitfalls**:
  - Re-rendering the entire TaskBoard on a single status update (fix: use `React.memo` on columns/cards).

## When to Use

Apply this skill during final Pull Request reviews, architectural audits, or when implementing new core features requiring RBAC.
