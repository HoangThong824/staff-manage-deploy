---
name: code-review
description: Standard procedure for reviewing changes in the staff-mng project.
origin: ECC
---

# Code Review Skill

This skill provides a structured method for reviewing code within the Staff Management System, ensuring scalability, data integrity, and UI consistency.

## Core Concepts

- **Unidirectional Data Flow**: All state changes must originate from `DataContext.tsx`.
- **Persistence Integrity**: Mutations must be followed by a synchronous call to `LocalStorage`.
- **Component Modularity**: UI components should be decoupled from specific data IDs where possible, using props and context.

## Code Examples

```typescript
// Example of a correct data mutation in DataContext
const updateTask = async (id: string, updates: any) => {
    // 1. Update in-memory data
    const updated = dataRef.current.tasks.map(t => 
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    // 2. Sync State and LocalStorage using saveData helper
    saveData({ ...dataRef.current, tasks: updated });
    return updated.find(t => t.id === id);
};
```

## Best Practices

- **Validate Props**: Always define clear interfaces for component props.
- **Hook Usage**: Use `useData()` instead of direct storage access in components.
- **Tailwind Consistency**: Use `clsx` or `tailwind-merge` for dynamic classes.
- **Don'ts**: NEVER modify `localStorage` directly inside a component; always use a context action.

## When to Use

Apply this skill whenever a pull request is submitted or when verifying new features involving data persistence or UI updates.
