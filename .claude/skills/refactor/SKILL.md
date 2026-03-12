---
name: refactor
description: Guidelines for refactoring React components and logic in the staff-mng project.
origin: ECC
---

# Refactoring Skill

This skill outlines the process for safely improving the internal structure of existing code without changing its external behavior, specifically for the staff-mng project architecture.

## Core Concepts

- **Component Decomposition**: Break down large components (like `EditEmployeeForm`) into smaller, reusable UI atoms.
- **Logic Extraction**: Move complex business logic from UI components into the `DataContext` or utility functions in `lib/`.
- **DRY Principle**: Ensure common patterns (like notification triggers) are centralized.

## Code Examples

```typescript
// Refactoring example: Extracting a formatting utility
// BEFORE: Inline formatting
<span>{new Date(task.dueDate).toLocaleDateString()}</span>

// AFTER: Using a centralized utility
import { formatDisplayDate } from '@/lib/utils';
<span>{formatDisplayDate(task.dueDate)}</span>
```

## Best Practices

- **Atomic Commits**: Keep refactoring steps small and verifiable.
- **Type Safety**: Use TypeScript to catch breakages when changing function signatures.
- **Manual Verification**: Always verify re-renders and data persistence after changing the flow.
- **Don't**: Change logic and refactor in the same step. Refactor first, then add/change behavior.

## When to Use

Use this skill when cleaning up legacy code, preparing a component for a new feature, or reducing technical debt in the project.
