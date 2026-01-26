# System Patterns

## Architecture

The application follows a **Single Page Application (SPA)** architecture using React, communicating directly with **Supabase** as a Backend-as-a-Service (BaaS).

### Frontend (Client-Side)

- **Framework:** Next.js 16 with App Router and Turbopack.
- **Routing:** Next.js App Router for file-based routing.
- **State Management:** React Context (`AuthProvider`) for global auth state; local state for component-level data.
- **Styling:** Tailwind CSS v4 with CSS variables for theming (OKLCH color space).
- **Theme Management:** `next-themes` for light/dark mode switching with `ThemeToggleSimple` component.
- **UI Components:** Shadcn/UI (based on Radix UI) for accessible, composable components.

### Backend (Supabase)

- **Database:** PostgreSQL.
- **API:** Auto-generated REST/GraphQL APIs provided by Supabase.
- **Auth:** Supabase Auth (handling JWTs).
- **Storage:** Supabase Storage for images and documents.
- **Security:** Row Level Security (RLS) policies enforce data access control directly at the database level.

## Code Organization

- `src/app/`: Next.js App Router pages and layouts.
  - `src/app/(app)/`: Authenticated application routes (dashboard, projects, catalog, etc.).
  - `src/app/(marketing)/`: Public marketing pages (homepage, about, pricing).
  - `src/app/auth/`: Authentication flow pages.
- `src/components/`: Reusable UI components (shadcn) and domain-specific components.
  - `src/components/layouts/`: Layout wrappers (e.g., `AppLayoutClient`).
  - `src/components/dialogs/`: Feature-specific dialog components.
  - `src/components/ui/`: Base UI primitives from shadcn/ui.
- `src/modules/`: Feature-specific modules (e.g., `project-dashboard`, `project-budget`).
- `src/lib/`: Utility functions and Supabase client configuration.
- `src/types/`: Shared TypeScript interfaces/types (Centralized to avoid circular dependencies).
- `src/styles/`: Global CSS with theme definitions (OKLCH colors).
- `supabase/migrations/`: SQL migration files for database schema versioning.

## Key Patterns

- **Type-Only Imports:** Use `import type { ... }` for interfaces to prevent runtime circular dependency errors in Vite.
- **Feature Folders:** Group related pages and dialogs within feature directories (e.g., `src/pages/projects/`).
- **RLS Policies:** All database tables have RLS enabled. Policies ensure users can only access their own data (`auth.uid() = user_id`).
