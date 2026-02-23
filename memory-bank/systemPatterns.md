# System Patterns

## Brand & Identity

- **Product name:** Veta.
- **Logo:** `VetaLogo` component (`src/components/veta-logo.tsx`) renders theme-aware assets from `public/img/veta-light.webp` (light theme) and `public/img/veta-dark.webp` (dark theme). Used in app sidebar, auth page, and marketing layout (header/footer). Optional wordmark "Veta" via `showWordmark` prop.
- **Logo Typography (Wordmark):**
  - Font family: Montserrat (`var(--font-montserrat)`)
  - Font size: 16px (text-base)
  - Font weight: 300 (font-light)
  - Line height: 20px
  - Vertical alignment: middle
  - Text alignment: left
  - Letter spacing: wide (tracking-wide)
- **Logo Visual Effects:**
  - Dark mode: Subtle white outer glow (`drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`) to enhance visibility on dark backgrounds
  - Light mode: No additional effects

## Architecture

The application uses **Next.js App Router** for routing and SSR where needed, with the authenticated app behaving like an SPA. It communicates directly with **Supabase** as a Backend-as-a-Service (BaaS).

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
- **Storage:** Backblaze B2 for file bytes. Central `assets` table (PostgreSQL) holds metadata (url, storage_path, bytes, owner_table, owner_id); domain tables (`products`, `project_documents`, `space_images`) have optional `asset_id`. Upload APIs create an asset row and return `assetId`; delete/replace removes the asset and B2 file. `user_storage_usage` is maintained by triggers from `assets` (and legacy rows where `asset_id` is null).
- **Security:** Row Level Security (RLS) policies enforce data access control directly at the database level.

## Code Organization

- `src/app/`: Next.js App Router pages and layouts.
  - `src/app/(app)/`: Authenticated application routes (dashboard, projects, catalog, etc.).
  - `src/app/(marketing)/`: Public marketing pages (homepage, about, pricing).
  - `src/app/auth/`: Authentication flow pages.
- `src/components/`: Reusable UI components (shadcn) and domain-specific components.
  - `src/components/layouts/`: Layout wrappers (e.g., `AppLayoutClient`).
  - `src/components/veta-logo.tsx`: Brand logo component (theme-aware).
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
