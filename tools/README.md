# Project Tools & Utilities

The `tools/` directory is designed to house peripheral scripts, AI prompts, and developer utilities that support the core application but are not part of the production bundle.

## Directory Structure

### `scripts/`
Contains executable Node.js, bash, or PowerShell scripts meant for development, data migration, or operational tasks.

**Common Use Cases:**
- `export-db.js`: A specialized script allowing users to download a JSON snapshot of their current `LocalStorage` state, preventing data loss.
- `seed-generator.js`: A script to generate mock data (e.g., 50 fake employees with Faker.js) for load testing the UI and Kanpur board performance.

### `prompts/`
Contains standardized Markdown templates designed specifically for interacting with AI coding assistants (like Claude, GitHub Copilot). 

**Common Use Cases:**
- `bug-report.md`: A structured template ensuring developers provide all necessary context (Screenshots, Console Logs, LocalStorage State) when reporting an issue.
- `feature-request.md`: A template outlining the required sections (Impact on Architecture, Data Flow Changes, UI Mockups) before a new feature is approved for development.

## Philosophy
Keep this folder clean. Every script should have a clear purpose, be well-documented at the top of the file, and ideally be executable via an `npm run` alias defined in `package.json`.
