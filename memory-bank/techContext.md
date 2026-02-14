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

- **Next.js:** `next.config.ts` with Turbopack, path aliases (`@/*`), module resolution for PDF generation, and `NEXT_PUBLIC_APP_NAME: "Veta"` for the product brand.
- **Brand assets:** Logo images in `public/img/` — `veta-light.webp` (light theme) and `veta-dark.webp` (dark theme). Referenced by the `VetaLogo` component.
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
  - Backblaze B2 para imágenes, documentos y renders: B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_ID, B2_BUCKET_NAME.
  - Docker uses `extra_hosts: localhost:host-gateway` for Supabase connectivity.

## Database Schema (Key Tables)

- `profiles`: Extends auth.users. Fields: `full_name`, `email`, `avatar_url`, `company`, `public_name`, `default_tax_rate`, `default_currency`.
- `projects`: Main project entity (with address, completed_date fields).
- `clients`: Client CRM data.
- `spaces`: Spaces within a project.
- `space_images`: Images/renders associated with spaces. Pueden subirse por URL o por archivo (B2).
- `products`: Global item catalog (reference_url, image_url). Imágenes en Backblaze B2 (`assets/{userId}/catalog/` o `assets/{userId}/projects/{projectId}/img/`). Compresión Sharp (1200px, WebP) en servidor.
- `project_items`: Join table (Project <-> Product) with custom pricing/status and purchase_order_id.
- `suppliers`: Vendor directory.
- `purchase_orders`: Grouped orders by supplier with status tracking.
- `additional_project_costs`: Additional costs per project (shipping, installation, etc.).
- `project_notes`: Project diary/notes (with archived field).
- `project_documents`: Documents linked to projects. Subida por URL o archivo (B2). Tipos: PDFs, docs, hojas de cálculo, presentaciones, texto (máx. 10MB).

## Known Constraints/Notes

- **Circular Dependencies:** Be careful with importing interfaces directly from component files. Use `src/types/index.ts`.
- **PostCSS:** Tailwind v4 requires `@tailwindcss/postcss` plugin.
