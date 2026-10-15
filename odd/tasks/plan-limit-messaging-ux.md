# Plan limit messaging UX (#218)

Objective: Honest Base limit UX (modal, storage banners, Settings comparison, waitlist CTA). Branch: `feat/plan-limit-messaging-ux-218`. Delivery: ask-on-risk. Runner: Vitest in Docker.

## Specs

- S1: `NEXT_PUBLIC_PAYMENTS_ENABLED` gates CTA; default false → “Tell me when Pro is available” + notify-interest lead; true → Upgrade to plan change. No trial/price until live.
- S2: New project at active limit opens PlanLimitModal before form; DB `PLAN_LIMIT_EXCEEDED` maps to same modal. Not now + unpaid archive path. ES/EN.
- S3: Storage ≥80% banner in uploaders (7d dismiss); 100% structured API `{ code: STORAGE_LIMIT }` + inline i18n error with free-space path.
- S4: Settings → Plan shows usage + Base/Pro/Studio from plan config; remove limitedOffer UI.
- S5: Gated features: short explain + link/CTA; session-once `limit_hit`.
- S6: Events `limit_hit` and `limit_cta_clicked` with type props.
- S7: Seed `base-limits@veta.pro` at limits; `pnpm run seed:base-limits` (+ `--full`).

## Tasks

- T1 S1,S6 — events + flag + notify API — inline — done
- T2 S2 — project modal + pre-check — inline — done
- T3 S3 — storage UX — inline — done
- T4 S4 — Settings compare — inline — done
- T5 S5 — feature locked copy — inline — done
- T6 S7 — seed script — inline — done

## Log

- L1: User: proceed (implement plan for #218 including fake limits account for visual QA).
- L2: Implemented all work units on `feat/plan-limit-messaging-ux-218`. Focused Vitest green. Seed: `pnpm run seed:base-limits`.
