---
name: kanban-builder
description: Advanced dnd-kit Kanban boards with Framer Motion.
---
# Skill: Kanban Builder StaffMNG
## Implementation
1. **Core**: `DndContext` + `sensors` (Pointer, Keyboard).
2. **Hierarchy**: `SortableContext` -> `TaskColumn` -> `TaskCard`.
3. **Persistence**: Call `updateTask` on `onDragEnd`.
4. **Motion**: Use `Framer Motion` for entry/exit animations.
5. **Mobile**: Verify touch sensors and responsive grid.
6. **Git**: **Auto-commit after board completion.**

## Verification
Ensure items don't jump and overlays are correctly positioned.
