# Runbook: Deployment & Production Build

This guide provides instructions on how to compile the Staff Management System for production and deploy it to a hosting environment. The project is optimized for deployment on Vercel, but can be hosted on any environment that supports Node.js or static Next.js exports.

## 1. Preparing for Production (Local Verification)

Before triggering a deployment pipeline, always verify the build locally to catch TypeScript errors or missing dependencies.

1. **Run the Linter**:
   Ensure there are no critical linting errors.
   ```bash
   npm run lint
   ```

2. **Execute the Build**:
   This compiles the Next.js application, generating optimized static HTML, CSS, and JavaScript chunks.
   ```bash
   npm run build
   ```

3. **Test the Production Build**:
   Start a local server serving the optimized `.next` output.
   ```bash
   npm run start
   ```
   Access the server (usually on port 3000) and perform a sanity check (login, create task, move task).

## 2. Deployment to Vercel (Recommended)

Vercel is the creator of Next.js and provides zero-configuration deployments for Next.js applications.

### Option A: Vercel Dashboard (GitHub Integration)
1. Push your code to a GitHub repository.
2. Log in to your [Vercel Dashboard](https://vercel.com).
3. Click **"Add New..." -> "Project"**.
4. Import the relevant GitHub repository.
5. Vercel will automatically detect the Next.js framework.
6. Click **Deploy**.

### Option B: Vercel CLI
1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Run the deploy command from the project root:
   ```bash
   vercel
   ```
   (Follow the prompt instructions. Use `vercel --prod` for a production deployment).

## 3. Deployment Caveats (LocalStorage Specifics)

Because this application currently uses `LocalStorage` for its database, you **must understand** the following limitations of the deployed version:

- **State is Isolated per Client**: If User A visits the deployed URL on their laptop and creates a Task, User B visiting the same URL on their phone will **not** see that Task.
- **No Shared Database**: 100 users hitting the deployed site means 100 isolated local databases are running concurrently on 100 different devices.
- **Data Loss on Cache Clear**: If a user clears their browser data (specifically "Cookies and other site data"), their entire account and all tasks created on that device will be permanently erased.

**Purpose of Deployment**: In its current architectural state, deploying this application is primarily for demonstration, portfolio showcasing, or allowing individual users to evaluate the UI/UX flows in isolation. It is not ready for multi-user, synchronized production use until backend API integration is completed.
