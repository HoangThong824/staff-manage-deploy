# AI Prompt: Bug Report Formulation

**Purpose**: Use this template when reporting an issue to an AI assistant or another developer to ensure all necessary environmental and contextual data is provided.

---

## 1. Issue Description
**What is the problem?**
[Provide a clear, concise description of the bug. Example: "The 'Edit User' modal does not sync the updated name back to the Sidebar component immediately." ]

## 2. Steps to Reproduce
**How can I trigger this bug?**
1. [Step 1: Navigate to 'Employees' page]
2. [Step 2: Click 'Edit' on employee 'EMP001']
3. [Step 3: Change first name and click 'Save']
4. [Step 4: Observe the Sidebar name does not update until manual refresh]

## 3. Expected vs. Actual Behavior
- **Expected**: [The Sidebar should reactively update the User's name without a page reload.]
- **Actual**: [The LocalStorage updates correctly, but the UI state is stale.]

## 4. Technical Context (CRITICAL)
- **Relevant Component**: [e.g., `src/components/admin/EditEmployeeForm.tsx`]
- **Relevant Data Model**: [e.g., `User` interface in `db.ts`]
- **Error Logs**: [Paste any browser console errors or Next.js terminal warnings here in a code block]

## 5. LocalStorage Dump (If applicable)
[Since this app uses LocalStorage, providing a snippet of the broken state helps immensely.]
```json
{
  "staff_session": {
    "user": { "name": "Old Name" }
  }
}
```

## 6. Screenshots/Recordings (Optional)
[Attach links or descriptions of UI visual bugs here]
