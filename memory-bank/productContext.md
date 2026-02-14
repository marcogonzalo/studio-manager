# Product Context

## Project Overview

**Veta** is a web application for interior design project management. It streamlines the workflow of interior designers and handles the entire project lifecycle from client intake to budget generation and purchasing. The product name and brand identity (logo, metadata, marketing copy) are unified under "Veta".

## Core Problems Solved

- **Fragmented Data:** Centralizes client info, project details, catalog items, and financial data.
- **Complex Budgeting:** Automates the calculation of costs, markups, and final prices.
- **Visual Presentation:** Generates visual budgets (grids of images with prices) for clients.
- **Purchasing Chaos:** Tracks orders across multiple suppliers and projects.

## Target Audience

- Freelance Interior Designers
- Small to Medium Design Agencies

## Key Features

- **Project Management:** Track status, dates, and phases.
- **Client Management:** CRM-like features for client details.
- **Catalog & Suppliers:** Global database of products and suppliers.
- **Space-by-Space Planning:** Organize items by specific spaces (e.g., Living Room, Master Bedroom, Terrace, Office).
- **Visual Budgeting:** Add items to spaces, set markups, and view visual summaries.
- **Purchasing & Logistics:** Generate Purchase Orders (POs) and track delivery status.
- **Documentation:** Attach plans, contracts, and renders to projects.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS, Shadcn/UI.
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime).
- **Infrastructure:** Docker (local development).

## Brand

- **Product name:** Veta.
- **Logo:** Dual asset for theme — `veta-light.webp` (light mode), `veta-dark.webp` (dark mode), served from `public/img/` and used via the `VetaLogo` component across app layout, auth, and marketing pages.
- **Logo Typography:** Montserrat font, 16px, weight 300 (light), with subtle white glow effect in dark mode for enhanced visibility.
- **Marketing Copy Updates:**
  - Hero headline: "Gestiona tus proyectos de diseño sin complicaciones"
  - Hero description: "La plataforma todo-en-uno para diseñadores de interiores. Administra proyectos, clientes, proveedores y presupuestos desde un solo lugar y toma el control."
  - Trial period: "El período de pruebas es de 30 días."
  - Footer tagline: "La plataforma para gestión de proyectos de diseño interior."

## Design Philosophy

- **Aesthetic:** Natural, pastel, earthy tones (Sage, Beige, Warm White) reflecting a modern interior design aesthetic.
- **UX:** Clean, spacious, and visual-first interface.
