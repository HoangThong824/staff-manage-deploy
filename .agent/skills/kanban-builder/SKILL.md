---
name: kanban-builder
description: Advanced dnd-kit Kanban boards with Framer Motion.
origin: ECC
---

# Kanban Builder StaffMNG

Implementation guide for performant, accessible drag-and-drop boards using `@dnd-kit` and `Framer Motion`.

## Core Concepts

- **Stable Hierarchy**: `DndContext` -> `SortableContext` -> `DroppableContainer` -> `DraggableItem`.
- **Overlay Pattern**: Use `DragOverlay` to render the moving card outside the normal DOM flow for better performance and z-index management.
- **Atomic Updates**: Trigger `updateTask` only on `onDragEnd` to minimize storage I/O.

## Code Examples

```tsx
// Standard sensors configuration
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor)
);

<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext items={taskIds}>
    {/* Map cards here */}
  </SortableContext>
  <DragOverlay>
    {activeId ? <TaskCard task={activeTask} /> : null}
  </DragOverlay>
</DndContext>
```

## Best Practices

- **Guidelines**:
  - Ensure `id` used in SortableContext is stable (e.g., `task.id`).
  - Add `framer-motion` layout animations for smooth list shifting.
- **Pitfalls**:
  - Using index as Sortable ID (causes animation glitches).
  - Heavy logic inside `onDragMove` (causes lag).

## When to Use

Use when building new status-based views, project management boards, or item prioritization lists.
