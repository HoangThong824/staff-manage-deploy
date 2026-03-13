---
name: refactor
description: Component refactoring with Memoization & DataContext sync.
---
# Skill: Refactor StaffMNG
## Principles
- **Functional Parity**: 100% logic retention.
- **Memoization**: Always use `React.memo` for iterated items (Cards, Rows).
- **Hooks**: Use `useMemo` for filters/sorts; `useCallback` for props.
- **State Source**: Pull data ONLY from `useData()`. Avoid nested/local sync state.
- **Structure**: Break large components into sub-folders if they exceed 300 lines.
- **Git**: ⚠️ **Perform auto-commit after completion.**

## Format
Briefly list "Before vs After" changes + Commit Message.
