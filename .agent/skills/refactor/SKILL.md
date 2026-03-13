---
name: refactor
description: Component refactoring with Memoization & DataContext sync.
origin: ECC
---

# Refactor StaffMNG

Guidelines for restructuring components to improve performance, maintainability, and architectural alignment with the project's client-side data model.

## Core Concepts

- **Memoization Strategy**: Iterated items (Cards, Columns, Rows) must be memoized to prevent parent-induced re-renders.
- **Single Source of Truth**: Data must always flow from `useData()`. Internal component state should be reserved for transient UI states (e.g., isExpanded).
- **Commit Transparency**: Every refactoring cycle must conclude with an automated git commit documenting specific changes.

## Code Examples

```tsx
// Optimized Component Structure
import { memo } from 'react';

const TaskCard = memo(({ task }: { task: Task }) => {
  // Logic here stays stable unless task prop changes
  return <div>{task.title}</div>;
});

TaskCard.displayName = 'TaskCard';
```

## Best Practices

- **Guidelines**:
  - Split components exceeding 300 lines into sub-components.
  - Use `useCallback` for functions passed as props to memoized children.
- **Pitfalls**:
  - Forgetting `displayName` on memoized components (broken devtools).
  - Syncing props to local state unnecessarily (causes stale data bugs).

## When to Use

Use during performance audits, when tackling technical debt, or when splitting large page components for better readability.
