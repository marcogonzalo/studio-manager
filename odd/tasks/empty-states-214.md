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

- T1 S1-S3 — inline — done — `5fd5ed3` PR1 shared component
- T2 S4 — inline — done — `6c77878` PR2 app pages
- T3 S5 — inline — done — `be3d86f` PR3 modules
- T4 S6 — inline — done — PR4 sample/public/docs

## Log

- L1: Implement plan Empty states (#214) and GTM alignment (#181) as specified.
- L2: A1 EmptyState + tests + DESIGN.md committed on `feat/empty-state-component`.
- L3: A2 app pages + add-item dialog migrated to EmptyState with ES/EN value copy.
- L4: A3 project modules + space-images dialog migrated.
- L5: A4 sample banner CTA, sample-only prompts, public view copy, orphan key removed, docs/empty-states.md.
