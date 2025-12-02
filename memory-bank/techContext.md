# Tech Context

## Development Environment

- **Language:** TypeScript (Strict mode enabled).
- **Runtime:** Node.js (for tooling), Browser (for execution).
- **Package Manager:** npm.
- **Containerization:** Docker & Docker Compose for consistent dev environment.

## Dependencies

- **Core:** `react`, `react-dom`, `react-router-dom`.
- **Backend Client:** `@supabase/supabase-js`.
- **Styling:** `tailwindcss`, `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` (icons).
- **Forms:** `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Utilities:** `date-fns`, `sonner` (toasts).

## Configuration

- **Vite:** `vite.config.ts` configured with path aliases (`@/*`).
- **Tailwind:** `src/index.css` using Tailwind v4 syntax (`@theme`, CSS variables).
- **Supabase:** Local instance via `npx supabase start`.
- **Environment Variables:** `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).

## Database Schema (Key Tables)

- `profiles`: Extends auth.users.
- `projects`: Main project entity.
- `clients`: Client CRM data.
- `spaces`: Spaces within a project.
- `products`: Global item catalog.
- `project_items`: Join table (Project <-> Product) with custom pricing/status.
- `suppliers`: Vendor directory.
- `purchase_orders`: Grouped orders by supplier.

## Known Constraints/Notes

- **Circular Dependencies:** Be careful with importing interfaces directly from component files. Use `src/types/index.ts`.
- **PostCSS:** Tailwind v4 requires `@tailwindcss/postcss` plugin.
