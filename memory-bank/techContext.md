# Tech Context

## Development Environment

- **Framework:** Next.js 16.1.4 (App Router with Turbopack).
- **Language:** TypeScript (Strict mode enabled).
- **Runtime:** Node.js (SSR/SSG), Browser (Client components).
- **Package Manager:** npm.
- **Containerization:** Docker & Docker Compose for consistent dev environment.

## Dependencies

- **Core:** `react`, `react-dom`, `next`.
- **Backend Client:** `@supabase/ssr`, `@supabase/supabase-js`.
- **Styling:** `tailwindcss`, `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` (icons).
- **Theming:** `next-themes` for theme management. OKLCH color space for perceptually uniform colors. Dual theme system (light/dark) with CSS custom properties.
- **Forms:** `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Utilities:** `date-fns`, `sonner` (toasts).
- **PDF Generation:** `@react-pdf/renderer` (for budget PDF generation).

## Configuration

- **Next.js:** `next.config.ts` with Turbopack, path aliases (`@/*`), and module resolution for PDF generation.
- **Tailwind:** `src/styles/globals.css` using Tailwind v4 syntax (`@theme`, CSS variables).
- **Theme System:**
  - **Light Mode:** Natural/pastel palette with warm cream backgrounds and sage green accents.
  - **Dark Mode:** Soft dark beige palette (oklch) harmonizing with light mode aesthetic.
  - **Color Space:** OKLCH for precise, perceptually uniform color control.
  - **Implementation:** CSS custom properties with theme variants (`:root`, `.dark`).
- **Supabase:** 
  - Local instance via `npx supabase start`.
  - SSR client configuration for browser, server, and middleware.
  - PKCE authentication flow with magic links.
- **Environment Variables:** 
  - `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).
  - Docker uses `extra_hosts: localhost:host-gateway` for Supabase connectivity.

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
