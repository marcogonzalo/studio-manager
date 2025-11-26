# System Patterns

## Architecture
The application follows a **Single Page Application (SPA)** architecture using React, communicating directly with **Supabase** as a Backend-as-a-Service (BaaS).

### Frontend (Client-Side)
- **Framework:** React with Vite.
- **Routing:** `react-router-dom` for client-side routing.
- **State Management:** React Context (`AuthProvider`) for global auth state; local state for component-level data.
- **Styling:** Tailwind CSS v4 with CSS variables for theming (OKLCH color space).
- **UI Components:** Shadcn/UI (based on Radix UI) for accessible, composable components.

### Backend (Supabase)
- **Database:** PostgreSQL.
- **API:** Auto-generated REST/GraphQL APIs provided by Supabase.
- **Auth:** Supabase Auth (handling JWTs).
- **Storage:** Supabase Storage for images and documents.
- **Security:** Row Level Security (RLS) policies enforce data access control directly at the database level.

## Code Organization
- `src/components/`: Reusable UI components (shadcn) and domain-specific components.
- `src/layouts/`: Layout wrappers (e.g., `AppLayout`, `AuthLayout`).
- `src/lib/`: Utility functions and Supabase client configuration.
- `src/pages/`: Page components corresponding to routes.
  - `src/pages/[module]/`: Feature-specific pages (e.g., `projects`, `clients`).
- `src/types/`: Shared TypeScript interfaces/types (Centralized to avoid circular dependencies).
- `supabase/migrations/`: SQL migration files for database schema versioning.

## Key Patterns
- **Type-Only Imports:** Use `import type { ... }` for interfaces to prevent runtime circular dependency errors in Vite.
- **Feature Folders:** Group related pages and dialogs within feature directories (e.g., `src/pages/projects/`).
- **RLS Policies:** All database tables have RLS enabled. Policies ensure users can only access their own data (`auth.uid() = user_id`).

