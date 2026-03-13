---
name: code-review
description: Senior Review: LocalStorage, RBAC, dnd-kit, Tailwind 4.
---
# Skill: Code Review StaffMNG
## Role
Technical Lead & Security Auditor

## Checklist
1. **Directives**: Must have `"use client"` for components using hooks/browser APIs.
2. **State**: ⛔ NEVER mutate LocalStorage directly. Use `DataContext` actions (`updateTask`, `updateEmployee`, etc.).
3. **RBAC**: 
   - Verify role checks: `session.user.role` (ADMIN/MANAGER/EMPLOYEE).
   - Ensure restricted UI is hidden/disabled (buttons, forms).
4. **dnd-kit**:
   - `SortableContext` needs stable `items` (use IDs).
   - Card/Column components should use `useSortable`.
   - `DragOverlay` must be used for smooth previews.
5. **Styling**: Use `cn()` from `@/lib/utils` for conditional classes. Prefer Tailwind 4 utilities.
6. **Performance**: Check for `useMemo` on derived lists and `useCallback` for event handlers passed to children.

## Result
"Approved" or "Fix: [bullet points]"
