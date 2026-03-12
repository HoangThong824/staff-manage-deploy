# Runbook: Project Setup Guide

This document outlines the step-by-step procedure for new developers to configure their local environment and successfully run the Staff Management System.

## 1. System Requirements
- **Node.js**: Minimum version `18.17.0` (LTS recommended).
- **Package Manager**: `npm` (v9+).
- **Browser**: Modern web browser (Chrome, Edge, Firefox, Safari).
- **IDE**: Visual Studio Code is highly recommended.

### Required VS Code Extensions
To ensure code style consistency, install the following extensions:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)

## 2. Installation & Initialization

1. **Clone the repository** (or download the source code):
   ```bash
   git clone <repository-url>
   cd staff-mng
   ```

2. **Install dependencies**:
   Run the following command in the project root to install all required packages defined in `package.json`.
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Currently, the project does not strictly require a `.env` file since it uses `LocalStorage`. However, a `.env` template exists. You may copy it if you plan to add integrations later:
   ```bash
   cp .env.example .env.local
   ```

## 3. Running the Development Server
Execute the following command to start the Next.js development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 4. Initial Data Seeding & Authentication
Because the application uses LocalStorage, you will start with an empty state. The system is designed to automatically seed the database with initial users and departments on first load.

### Default Admin Credentials
Upon the first initialization, the system will inject the following default administrator credentials into your LocalStorage:
- **Email**: `admin@admin.com`
- **Password**: `admin123`

Use these credentials on the Login page to access the system.

## 5. Troubleshooting Common Issues

### Issue: "Invalid email or password" after clearing browser data.
- **Cause**: The data seed logic triggers only when the base `staff_mng_seed_v` key is missing. If you cleared `staff_mng_db` but not the seed key, the system won't regenerate the admin user.
- **Fix**: Open Developer Tools -> Application -> LocalStorage. Clear *all* keys associated with `localhost:3000` and refresh the page.

### Issue: Tailwind styles not applying during development.
- **Cause**: The Next.js cache sometimes gets stuck or the Tailwind compiler misses a class.
- **Fix**: Stop the server (`Ctrl + C`), delete the `.next` folder in the project root, and restart (`npm run dev`).
