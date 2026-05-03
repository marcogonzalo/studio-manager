---
name: veta-testing
description: Write and run tests with Vitest and React Testing Library in the Veta project; follow TDD and coverage goals. Use when writing tests, reviewing coverage, or setting up mocks for Supabase or API routes.
---

# Veta – Testing

## Stack

- **Runner:** Vitest.
- **UI tests:** React Testing Library (`@testing-library/react`, `@testing-library/user-event`).
- **Coverage:** Aim for ≥85% on new code. Run `npm run test:coverage`.

## What to test

- Business logic, utilities, and data transformers (unit).
- Flows like “Add item to budget”, “Create project” (integration).
- API routes and server logic with mocked Supabase where needed.
- Avoid testing framework internals or third-party libraries.

## Mocks

- Supabase/auth and client: use `src/test/mocks/supabase.ts` (`createMockUser`, `createMockSession`, `mockSupabase`, `mockSupabaseAuth`).
- Mock at the boundary (e.g. `@/lib/supabase` or route handler deps); don’t mock Vitest/RTL.

## Edge cases

- Include empty state, invalid input, and error paths (e.g. Supabase `error` returned).
- For forms: required vs optional, validation errors, submit success/failure.

## Commands

- `npm run test` — run once.
- `npm run test:watch` — watch mode.
- `npm run test:coverage` — coverage report.
- `npm run test:ui` — Vitest UI.
