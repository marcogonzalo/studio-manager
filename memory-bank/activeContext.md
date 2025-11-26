# Active Context

## Current Status
The project is in **Phase 1 (MVP Complete)**. The core functionality requested has been implemented and is operational locally.

## Recently Completed
1.  **Environment Setup:** Vite + React + TS, Docker, Supabase Local.
2.  **Authentication:** Login/Signup with Supabase Auth.
3.  **Data Modules:**
    - Clients CRUD.
    - Suppliers CRUD.
    - Catalog (Products) CRUD.
    - Projects CRUD.
4.  **Project Detail Features:**
    - Room management.
    - Render/Image gallery per room.
    - **Budgeting:** Adding items, calculating markups/totals.
    - **Purchasing:** Generating POs from pending items.
    - **Documents:** Uploading/linking files.
    - **Notes:** Project diary.
5.  **UI/UX:**
    - Implemented "Natural/Pastel" theme (Sage/Beige).
    - Created a functional Dashboard with summary cards and empty states.
    - Fixed circular dependency build errors.

## Work in Progress / Next Steps
- **Image Uploads:** Currently, the app accepts image URLs. Integrating real file uploads to Supabase Storage bucket is the next logical step.
- **PDF Export:** The "Export PDF" button currently triggers `window.print()`. Implementing a generated PDF with `react-pdf` or similar would be an enhancement.
- **Deployment:** The app is running locally. Deployment to Vercel/Netlify + Supabase Cloud is pending.

## Active Decisions
- **Database:** We are using a remote Supabase DB (configured in .env) but running the app container locally. *Note: Schema sync to remote DB needs to be managed manually or via CI/CD.*
- **Types:** All shared interfaces moved to `src/types/index.ts` to solve build issues.

