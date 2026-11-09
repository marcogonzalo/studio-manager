# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the owner of an architecture or interior-design studio of about 2–12 people (internal persona: Elena). She is accountable to the client and for whether each job makes money. Admin work is eating time she wants for design. She decides, often after a site lead tries the tool.

Also served, not primary:

- Freelance interior designer or owner of a 1–3 person studio (internal persona: Lucía). Decides alone. Still a real audience (Base and Pro). `memory-bank/buyerPersona.md` still calls her the volume early-adopter. That priority is overridden here: Elena is primary.
- Site lead / project manager on a medium studio (internal persona: Javi). Does not buy. Daily use on a phone decides whether the studio keeps Veta.
- Operations / admin in a 10+ person studio (internal persona: Beatriz). Year-1 low priority. Enters when a studio already on Veta grows and needs export and reports she can trust.

Names above are internal labels, not customers.

## Product Purpose

Veta is project management for interior designers, architects, and design studios. It exists so a studio can run the job — clients, rooms, budgets, suppliers, site progress — from one record, and show the client that record without exposing margin.

Success: a new account reaches a real project plus a budget or a supplier within 7 days of signup. For the primary user, the client view is part of the job, not a later extra.

## Positioning

International tool for interior-design and architecture project control. A neighboring generic board (Monday, Notion, Trello, Asana, spreadsheets) cannot truthfully claim room-level budgets, supplier orders, margin, and a client view that hides margin. A heavy vertical ERP (Houzz Pro, Studio Designer, Programa, Dzylo) cannot truthfully claim this stays lighter than an ERP: start without standing up finance software. Accounting tools (Holded, Xero, QuickBooks) stay the system of record for official invoices. Veta does not replace them.

## Operating Context

Studios already run the job across WhatsApp, spreadsheets, paper, and a separate invoicing tool. Veta sits in that gap.

A job is organized by project, then by space. Money is a budget (catalog items or custom lines, cost, markup, client price) plus what was actually paid. Purchasing is supplier orders and delivery state. The client gets a public project view (`/view-project`) for renders, products, the current budget, and payments. Internal margin stays off that view.

Marketing and product copy ship in Spanish and English. App default theme is dark.

Shipped plans (EUR), from `src/app/llms.txt/route.ts`:

- Base: free, 1 project
- Pro: €25/month or €250/year, for independents
- Studio: €75/month or €750/year, for studios with a team
- Paid plans: 30-day trial, no card to start

## Capabilities and Constraints

In the product today: clients, project lifecycle, spaces, images and documents, budgets with markup and PDF output, product catalog, suppliers, purchase orders, logistics states, project notes, public client view, sample project on signup.

Constraints future work preserves:

- No official tax invoices (no Verifactu, no local e-invoicing). Export or hand off to the studio’s accounting tool.
- Do not bake one country’s professional rules, visas, or invoicing law into the product. Local content must be labeled local.
- Public client view does not show studio margin.
- Signup seeds one sample project (`is_sample`, completed). It does not consume the Base active-project slot until reopened. Onboarding “create a project” ignores it. No re-seed after delete.
- Funnel activation (service-role analytics, not an end-user dashboard): `project_created` or `sample_reopened` within 7 days of signup, plus `budget_created` or `supplier_created` in that window. Demo account `demo@veta.pro` is excluded.
- Row Level Security on every table. File bytes in Backblaze B2; metadata in Supabase.

Undecided, do not treat as commitments:

- Offline use on site. Raised as an objection by the site-lead persona. Not a shipped guarantee.
- Official accounting integrations and an API for firm ERPs. Export is the commitment. Specific connectors are not.
- Demographic ranges, time-spent claims, and euro amounts of “typical” losses in `memory-bank/buyerPersona.md`. Those are hypotheses. Marketing must not cite them as measured fact.
- Search questions listed in that persona file. Drafted from the profile, not from verified demand.

## Brand Commitments

Name: Veta. Contact: `hey@veta.pro`. Contact form delivers to `veta.pro.pm@gmail.com`.

Logos: `public/img/veta-light.webp`, `public/img/veta-dark.webp`, plus `public/img/veta-logo.png`, `public/img/veta-logo-rrss.png`, `public/img/veta-favicon-light.png`, `public/img/veta-favicon-dark.png`.

Voice, Spanish source line: “Gestiona tus proyectos de diseño sin complicaciones.” English product line, from `src/app/llms.txt/route.ts`: “Veta is project management software for interior designers, architects, and design studios.” Footer line: “La plataforma para gestión de proyectos de diseño interior.”

App default is dark mode. Palette, type, and components live in `DESIGN.md`, not here.

## Evidence on Hand

- `memory-bank/productContext.md` — name, audiences, marketing lines, plan-landing map
- `memory-bank/buyerPersona.md` — role model and competitive set; hypotheses are marked in that file and above
- `memory-bank/constraints.md` — sample project, activation events, storage, RLS
- `src/app/llms.txt/route.ts` — public product summary, plans, prices, “does not issue official tax invoices”
- `src/i18n/messages/en/marketing/pricing.json` and `src/i18n/messages/es/marketing/pricing.json` — shipped plan copy
- No verified customer testimonials, case studies, or press. Do not invent them.

## Product Principles

1. The buyer is the studio owner who must know whether each job makes money.
2. One record for the job: project, client, suppliers, budget, and a client view that never shows margin.
3. Lighter than an ERP. No official invoices. The accounting tool they already use stays the ledger.
4. International. Do not depend on one country’s invoicing law.
5. Activation is a real project plus a budget or a supplier inside 7 days, not a tour.
