# Empty states audit (#214)

Objective: shared EmptyState + value line + one primary CTA on every empty screen (ES/EN).
Branch strategy: chained PRs from `feat/empty-state-component` → app pages → modules → sample/public.
Delivery: `auto-chain` / stacked to main. Runner: Vitest in Docker (`docker compose exec app`).

## Specs

- S1: Shared `EmptyState` with icon, title, description, optional value, one primary action (`onClick` or `href`), optional secondary, variants `card` | `inline`; passes `data-onboarding-target`; theme tokens only.
- S2: Unit tests cover value presence, CTA click, href-as-link, single primary CTA; coverage ≥80% on component file.
- S3: DESIGN.md documents EmptyState.
- S4: App pages (dashboard, projects, clients, suppliers, catalog) + add-item dialog use EmptyState with value + CTA; ES/EN i18n.
- S5: Project modules + space-images dialog use EmptyState with value + CTA (notes hint OK without button); ES/EN i18n.
- S6: Sample banner CTA; sample-only first-project prompt via `countNonSampleProjects`; public view client tone (no CTA); delete orphan `noProductsVisible`; `docs/empty-states.md` copy table.

## Tasks

- T1 S1-S3 — inline — in progress — PR1 shared component
- T2 S4 — pending — PR2 app pages
- T3 S5 — pending — PR3 modules
- T4 S6 — pending — PR4 sample/public/docs

## Log

- L1: Implement plan Empty states (#214) and GTM alignment (#181) as specified.
