---
name: veta-frontend-components
description: Veta UI conventions — Tailwind v4, Shadcn/Radix, next-themes, Framer motion helpers, and globals. Use when building or styling components, marketing sections, or app views.
---

# Veta – Frontend components & styling

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**.
- **Tailwind CSS v4** with `@import "tailwindcss"` and `@theme inline` in `src/styles/globals.css`.
- **Shadcn/Radix** primitives under `src/components/ui/`.
- **Themes:** `next-themes` `ThemeProvider` in `src/app/layout.tsx` (`attribute="class"`). Respect the current `defaultTheme` and `enableSystem` values defined there.
- **Motion:** `framer-motion` via `AnimatedSection`, `StaggerContainer`, `StaggerItem` in `@/components/ui/animated-section`; `AnimatedCounter` in `@/components/ui/animated-counter` where needed.

## Tokens and layout

- Prefer **semantic utilities**: `bg-background`, `text-foreground`, `border-border`, `text-primary`, etc., backed by CSS variables in `src/styles/globals.css` (including brand tokens like `--brand-secondary`).
- Use **`cn()`** from `@/lib/utils` for conditional classes.
- **Responsive:** mobile-first (`w-full md:w-1/2`, etc.).

## Animations (marketing and app)

- Reveal on scroll: **`AnimatedSection`** with props `direction`, `delay`, `duration`, `once`, `triggerOnMount`; honor **`useReducedMotion`** (already wired in the component).
- Lists/grids: **`StaggerContainer`** + **`StaggerItem`** for staggered children.
- Timing aligned with `.cursor/rules/02-frontend.mdc`: easing `cubic-bezier(0.25, 0.4, 0.25, 1)`; ~200ms / 300ms / 500–600ms by context; stagger steps ~0.1–0.15s.

## Shadcn / forms

- Compose from `src/components/ui/*`. Do not fight Radix semantics.
- **Select:** never `SelectItem` with `value=""`. Optional fields: `undefined` in RHF `defaultValues` and `value={field.value ?? undefined}` — full detail in **`veta-forms-validation`**.

## Components structure

- **`src/components/ui`:** primitives, animation helpers, Shadcn exports.
- **`src/components`:** domain/feature components.
- Export style: match existing files (`export function Name` or const + export).

## Light and dark

- Both modes must remain usable. Use theme tokens (not hard-coded hex for surfaces/text) unless for one-off brand gradients documented in marketing sections.

## Related

- **`.cursor/rules/02-frontend.mdc`** — extended checklist (dialogs, hover, skeletons, DOM nesting).
- **`veta-forms-validation`** — forms and Select rules.
- **`frontend-design`** / **`web-design-guidelines`** (external skills) — when the user asks for higher-level UI polish or accessibility audits.
