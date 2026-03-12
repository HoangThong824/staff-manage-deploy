# Automation Hooks & Guardrails

This directory (`.claude/hooks`) is dedicated to automated scripts and validation routines that enforce project standards, code quality, and data integrity. These hooks can be triggered manually, mapped to Git hooks (pre-commit, pre-push), or integrated into a CI/CD pipeline.

## 1. Concept: Pre-Flight Validations
In a robust repository, developers should not be able to commit broken code. Hooks act as "guardrails" to prevent common mistakes.

### Example Hook: `lint-and-typecheck.sh`
A common script placed here would be:
```bash
#!/bin/bash
# .claude/hooks/lint-and-typecheck.sh
echo "Running ESLint..."
npm run lint || exit 1

echo "Checking TypeScript compilations..."
npx tsc --noEmit || exit 1

echo "All checks passed! Ready to commit."
```

## 2. Concept: Data Schema Validation
Because the application uses Schemaless `LocalStorage`, it is crucial that the default seed data (`src/context/DataContext.tsx`) strictly adheres to the TypeScript interfaces defined in `src/lib/db.ts`.

### Example Hook: `validate-seed-data.js`
A Node.js script could be written to import the `defaultSeed` object and validate it against a JSON Schema representation of `db.ts` to ensure no required fields are missing before deployment.

## Integrating with Git
To automatically execute these hooks before a git commit, you can use a library like `husky`.
```bash
npx husky install
npx husky add .husky/pre-commit ".claude/hooks/lint-and-typecheck.sh"
```
