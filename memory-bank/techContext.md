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
- **PDF Generation:** `@react-pdf/renderer` (for budget PDF generation).

## Configuration

- **Vite:** `vite.config.ts` configured with path aliases (`@/*`).
- **Tailwind:** `src/index.css` using Tailwind v4 syntax (`@theme`, CSS variables).
- **Supabase:** Local instance via `npx supabase start`.
- **Environment Variables:** `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).

## Database Schema (Key Tables)

- `profiles`: Extends auth.users.
- `projects`: Main project entity (with address, completed_date fields).
- `clients`: Client CRM data.
- `spaces`: Spaces within a project.
- `space_images`: Images associated with spaces.
- `products`: Global item catalog (with reference_url field).
- `project_items`: Join table (Project <-> Product) with custom pricing/status and purchase_order_id.
- `suppliers`: Vendor directory.
- `purchase_orders`: Grouped orders by supplier with status tracking.
- `additional_project_costs`: Additional costs per project (shipping, installation, etc.).
- `project_notes`: Project diary/notes (with archived field).
- `project_documents`: Documents linked to projects.

## Known Constraints/Notes

- **Circular Dependencies:** Be careful with importing interfaces directly from component files. Use `src/types/index.ts`.
- **PostCSS:** Tailwind v4 requires `@tailwindcss/postcss` plugin.
