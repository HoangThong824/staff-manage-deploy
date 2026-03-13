# Staff Management System (Staff-Mng)

A faculty and task management system built with Next.js, focused on offline-first data persistence via LocalStorage. This repository follows the Claude Code modular project structure to optimize AI collaboration and maintain clear contextual boundaries.

## System Architecture Overview
- **Frontend Framework**: Next.js 16 (App Router)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React icons, Framer Motion
- **State Management**: React Context API (`src/context/DataContext.tsx`)
- **Data Persistence**: Client-side LocalStorage (`src/lib/localStorage.ts`)
- **Key Drag & Drop library**: `@dnd-kit/core`

## Development Environment Setup
To ensure consistency across the development team, follow these prerequisites:
- Node.js >= 18.x
- npm >= 9.x
- Recommended Editor: VS Code with ESLint and Tailwind CSS IntelliSense extensions.

### Essential Commands
- `npm run dev` - Start the local development server on `localhost:3000`.
- `npm run build` - Compile the application for production deployment.
- `npm run start` - Start the production server (after `npm run build`).
- `npm run lint` - Run ESLint to catch syntax and style issues.

## Testing & Verification Patterns
Since the application relies heavily on LocalStorage and Context API:
1. **State Verification**: Always verify state changes by checking the browser's Developer Tools -> Application -> LocalStorage (`staff_mng_db` key).
2. **UI Updates**: Verify that components mapped to the Context API re-render correctly when `saveData` is invoked.
3. **Session Management**: Session login state is tracked via `staff_session` in LocalStorage.
4. **Auto-commit**: Always perform a `git commit` after completing significant changes (refactoring, new features, bug fixes) to preserve progress.

## Engineering Guardrails & Conventions
- **Data Mutations**: Direct mutation of `dataRef.current` without calling `setData` and `storage.set` is strictly prohibited. Always use the provided helper actions in `DataContext.tsx` (e.g., `createTask`, `updateEmployee`).
- **Styling**: Adhere to Tailwind CSS utility classes. Avoid creating custom CSS in `globals.css` unless necessary for global resets or specific animations. Use `clsx` and `tailwind-merge` for conditional class application.
- **Client Components**: Any component utilizing React hooks (`useState`, `useEffect`, `useContext`) or browser APIs must include the `"use client";` directive at the top of the file.
- **Server Components**: Keep layout and static pages as Server Components by default to optimize initial load times.

## Project Structure Highlights
- `/src/components`: Reusable UI elements (e.g., forms, boards, cards).
- `/src/context`: Global state management and business logic.
- `/src/lib`: Database schemas and utility functions.
- `/docs`: Architectural decisions and runbooks.
- `/.claude`: AI automation scripts and specialized agent skills.
- `/tools`: Development scripts and prompt templates.
