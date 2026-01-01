# Active Context

## Current Status

The project is in **Phase 1 (MVP Complete)**. The core functionality requested has been implemented and is operational locally.

## Recently Completed

1. **Environment Setup:** Vite + React + TS, Docker, Supabase Local.
2. **Authentication:** Login/Signup with Supabase Auth.
3. **Data Modules:**
    - Clients CRUD.
    - Suppliers CRUD.
    - Catalog (Products) CRUD with reference URLs.
    - Projects CRUD with address field.
4. **Project Detail Features:**
    - Space management with visual product grid.
    - Render/Image gallery per space.
    - **Budgeting:** Adding items, calculating markups/totals, editing items.
    - **Additional Costs:** Cost tracking by type (shipping, installation, etc.).
    - **Purchasing:** Manageable purchase orders with item selection.
    - **Documents:** Uploading/linking files.
    - **Notes:** Project diary with archive functionality.
5. **UI/UX:**
    - Implemented "Natural/Pastel" theme (Sage/Beige).
    - **Dashboard:** Real-time statistics including active projects, clients, expenses, and income (with placeholder for payment control).
    - Visual product selection with product detail modal.
    - Product image modals for detailed views.
    - Fixed circular dependency build errors.
6. **PDF Generation:**
    - Advanced PDF generation using `@react-pdf/renderer`.
    - Professional budget PDFs with grouped items by space, additional costs, and proper formatting.

## Work in Progress / Next Steps

- **Image Uploads:** Currently, the app accepts image URLs. Integrating real file uploads to Supabase Storage bucket is the next logical step.
- **Payment Control System:** System to track client payments with dates, amounts, and payment methods. Will feed into Dashboard income metrics.
- **Deployment:** The app is running locally. Deployment to Vercel/Netlify + Supabase Cloud is pending.

## Active Decisions

- **Database:** We are using a remote Supabase DB (configured in .env) but running the app container locally. *Note: Schema sync to remote DB needs to be managed manually or via CI/CD.*
- **Types:** All shared interfaces moved to `src/types/index.ts` to solve build issues.
