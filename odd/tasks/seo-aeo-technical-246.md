# SEO/AEO técnico #246

Objective: Serve crawler-visible JSON-LD, SSR counters/prices, hero definition, blog links, llms.txt/robots, and fixed titles.
Branch: `fix/seo-aeo-technical-246`
Delivery: ask-on-risk · one commit per issue case
Test runner: Vitest via `docker compose exec app` (or test profile if OOM)

## Specs

- S1: "Hoy el HTML servido tiene 0 `<script type=\"application/ld+json\">`. … Generarlo en server components … nativo. … Localizar Organization y SoftwareApplication por idioma… Offers por plan… Añadir schema a `/sobre-veta`. Mantener FAQPage, BlogPosting y BreadcrumbList."
- S2: "`animated-counter.tsx` L57 arranca en `useState(\"0\")`… El HTML del servidor debe llevar el valor final… Con `prefers-reduced-motion`, se muestra fijo. Revisar que la cifra esté respaldada o marcada como estimación."
- S3: "`product-mockup.tsx` mete como contenido \"12 Proyectos · 28 Clientes · €84k Ingresos\". Marcarlo con `aria-hidden`."
- S4: "Añadir junto al H1 una frase… qué es Veta y para quién… plan gratis de 1 proyecto, … desde 25 €/mes, … no emite facturas oficiales… Redacción validada (ES/EN lead copy)."
- S5: "El post Veta vs Excel… Añadir enlaces a `/precios` y `/en/pricing`, a las landings de software y al plan Pro."
- S6: "`/llms.txt` 404… Crear `src/app/llms.txt/route.ts`… En `robots.ts`, añadir grupos allow explícitos para GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot y Google-Extended…"
- S7: "Títulos \"… | Veta | Veta\"… Quitar el sufijo de los textos. … páginas de plan … no muestran el precio en el HTML servido… resolverlo…"

## Tasks

- T1 [S1] inline · done · commit d5a9a91
- T2 [S2] inline · done · commit 6759384
- T3 [S3] inline · done · commit 6007d57
- T4 [S4] inline · done · commit eb62357
- T5 [S5] inline · done · commit 5f6d3f0
- T6 [S6] inline · done · commit 9a1fb75
- T7 [S7] inline · done · commit 86aa9be

## Log

- L1: "ok. Proceed in a new branch. A commit per case." + issue https://github.com/marcogonzalo/studio-manager/issues/246
- L2: Hero lead copy validated by user (ES/EN proposal from prior turn).
- L3: Implemented all 7 cases on `fix/seo-aeo-technical-246`. Focused Vitest green via `docker compose --profile test run --rm test`. Not pushed. Acceptance curls against production pending deploy.
