# Google Tag Manager (GTM) and Google Analytics 4

Marketing routes (`/`, `/pricing` ↔ `/precios`, `/about`, `/contact`, `/legal`, plan landings) push a typed dataLayer. GTM container **GTM-5F6QXRQS** maps those events to GA4 **G-XSD1TYKK35** (Google Tag **GT-55BN544P**).

Issue tracker: [#181](https://github.com/marcogonzalo/studio-manager/issues/181).

## 0. Index

1. [Environment variable](#1-environment-variable)
2. [Where it is implemented](#2-where-it-is-implemented)
3. [dataLayer events](#3-datalayer-events)
4. [GTM trigger → tag matrix (canonical)](#4-gtm-trigger--tag-matrix-canonical)
5. [Manual fix checklist (#181)](#5-manual-fix-checklist-181)
6. [Auth and confirmation](#6-auth-and-confirmation)
7. [Demo funnel](#7-demo-funnel)
8. [GA4 conversions](#8-ga4-conversions)
9. [GDPR / Consent Mode v2](#9-gdpr--consent-mode-v2)
10. [References](#10-references)

## 1. Environment variable

```bash
NEXT_PUBLIC_GTM_ID=GTM-5F6QXRQS
```

Set in Vercel **Production** (and Preview if you want Preview debugging). Without it, GTM is not injected and `pushToDataLayer` is a no-op. See `.env.example`.

## 2. Where it is implemented

- **Snippet:** `src/components/gtm/gtm-script.tsx`
- **Consent gate:** `src/components/gtm/gtm-script-gate.tsx` — GTM loads only after analytics consent
- **Cookie banner:** `CookieConsentBanner` on public routes: `[locale]/layout` (marketing, auth, `/en`) and `src/app/page.tsx` (`/` skips the locale layout). Not mounted in `veta-app` (session required). First paint is visible; the banner hides after it reads `veta_cookie_consent`.
- **SPA page views:** `GtmPageView` → `pushPageView` (`page_view`)
- **Helpers:** `src/lib/gtm.ts` (`GTM_EVENTS`, `pushSelectPlan`, `pushViewPricing`, `pushCtaClick`, `pushDemoAccess`, …)
- **Consent update event:** `src/lib/consent.ts` pushes `consent_update` (param `consent_update: "cookie_consent"`)

## 3. dataLayer events

| Event                       | App helper                    | When                                                                         |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `page_view`                 | `pushPageView`                | Client route change (marketing/auth)                                         |
| `view_pricing`              | `pushViewPricing`             | Pricing page mount (`/precios` and `/en/pricing`)                            |
| `select_plan`               | `pushSelectPlan`              | Plan CTA click                                                               |
| `begin_checkout`            | `pushSelectPlan` (same click) | GA4 ecommerce start — **not** signup                                         |
| `cta_click`                 | `pushCtaClick`                | Header / hero / pricing CTAs (`cta_location`, `cta_text`, `destination_url`) |
| `contact` + `generate_lead` | `pushContact`                 | Contact form success                                                         |
| `generate_lead`             | `pushDemoRequest`             | Demo form success (`lead_source=demo_request`)                               |
| `demo_access`               | `pushDemoAccess`              | `/auth/complete?demo=1`                                                      |
| `sign_up`                   | `pushSignUp`                  | Funnel helper (prefer `sign_up_confirmed` for conversion)                    |
| `sign_up_confirmed`         | `pushSignUpConfirmed`         | Magic-link signup confirmation                                               |
| `login`                     | `pushLogin`                   | Funnel helper (prefer `login_confirmed`)                                     |
| `login_confirmed`           | `pushLoginConfirmed`          | Magic-link login confirmation                                                |
| `consent_update`            | consent module                | Cookie preference change                                                     |

App keeps `begin_checkout` on plan click (GA4 recommended). Do **not** map `begin_checkout` to signup in GTM.

## 4. GTM trigger → tag matrix (canonical)

Container: **GTM-5F6QXRQS**. Prefer **Custom Event** triggers on dataLayer names (locale-safe). Require **`analytics_storage`** on every GA4 tag.

| Tag (GA4 Event / Google Tag)    | Trigger                                            | Notes                                                                  |
| ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| Google Tag `GT-55BN544P`        | Consent Initialization / All Pages (after consent) | Default page views; avoid double-count with a second All Pages GA4 tag |
| ~~GA - All pages~~              | —                                                  | **Delete** or fix event name to `page_view` (never `{{Page URL}}`)     |
| GA4 - view_pricing              | CE `view_pricing`                                  | Replace URL filter `/pricing` (misses `/precios`)                      |
| GA4 - select_item / select_plan | CE `select_plan`                                   | Keep plan DLVs                                                         |
| GA4 - begin_checkout            | CE `begin_checkout`                                | Ecommerce from Data Layer; **not** begin_signup                        |
| GA4 - begin_signup              | Page Path matches RegEx `^/(en/)?sign-up`          | No `begin_checkout` trigger                                            |
| GA4 - cta_click                 | CE `cta_click`                                     | Params: `cta_location`, `cta_text`                                     |
| GA4 - sign_up                   | CE `sign_up`                                       | Optional funnel; conversion = `sign_up_confirmed`                      |
| GA4 - sign_up_confirmed         | CE `sign_up_confirmed`                             | Primary signup conversion                                              |
| GA4 - login                     | CE `login` only                                    | Remove `/sign-in` pageview to avoid double count                       |
| GA4 - login_confirmed           | CE `login_confirmed`                               |                                                                        |
| GA4 - contact                   | CE `contact`                                       |                                                                        |
| GA4 - generate_lead             | CE `generate_lead`                                 | Filter `lead_source` when needed                                       |
| GA4 - demo_access               | CE `demo_access`                                   | Wire orphan trigger                                                    |
| GA4 - page_view (SPA)           | CE `page_view`                                     | Only if Google Tag auto page views are off                             |
| (optional) consent              | CE `consent_update`                                | App does **not** send `cookie_consent` as event name                   |

**Data Layer Variables:** `plan_code`, `billing_period`, `method`, `lead_source`, `lead_status`, `plan_name`, `cta_location`, `cta_text`, `page_path`, `page_location`.

**DOM variable fix:** `DOM - Error text` selector → `.text-destructive` (not `-text-destructive`).

## 5. Manual fix checklist (#181)

Do this in [tagmanager.google.com](https://tagmanager.google.com) → container **GTM-5F6QXRQS**. Create workspace `fix-181` first.

1. **Variables** — Confirm DLVs listed above; add missing ones.
2. **GA - All pages** — Delete (preferred) or set Event Name to `page_view`. Do not leave Event Name = `{{Page URL}}`.
3. **view_pricing** — Custom Event trigger `view_pricing`; remove URL-only `/pricing` trigger.
4. **Begin Signup** — Remove `begin_checkout` trigger. Keep Page Path RegEx `^/(en/)?sign-up`. Add separate GA4 tag for `begin_checkout`.
5. **Orphans** — Attach GA4 tag to `demo_access`. Demo page path RegEx `^/(en/)?demo`. Cookie trigger: event `consent_update` or delete.
6. **Missing tags** — Add CE + GA4 for `cta_click`, and `sign_up` if you still track request step. Add SPA `page_view` tag only if auto page views are disabled.
7. **Consent** — Every GA4 tag → Advanced → Consent → require `analytics_storage`. Enable consent overview in container settings.
8. **DOM Error text** — Selector `.text-destructive`.
9. **Login** — Keep CE `login` only; drop `/sign-in` pageview fire.
10. **Preview** on `https://veta.pro`:
    - Accept cookies → GTM connects
    - `/precios` → `view_pricing` once
    - Plan click → `begin_checkout` + `select_plan` / `select_item`; **not** Begin Signup
    - `/sign-up` → Begin Signup; form path as configured
    - Header CTA → `cta_click`
    - Demo complete → `generate_lead` then `demo_access`
    - Incognito reject cookies → GTM must not load
11. **GA4 DebugView** — Event names must not look like URLs.
12. **Publish** — Version name `fix #181 dataLayer + i18n alignment`.
13. **Vercel** — Confirm `NEXT_PUBLIC_GTM_ID=GTM-5F6QXRQS` on Production; redeploy if changed.
14. Comment on [#181](https://github.com/marcogonzalo/studio-manager/issues/181) with published version id.

## 6. Auth and confirmation

- Cookie banner available on auth and `/veta-app` so confirmation links can load GTM after consent.
- `?auth_confirmed=signup|login` → `AuthConfirmedTracker` pushes `sign_up_confirmed` / `login_confirmed`.
- Prefer those confirmed events as GA4 conversions over request-time `sign_up` / `login`.

## 7. Demo funnel

1. `page_view` on `/demo` or `/en/demo`
2. `generate_lead` with `lead_source=demo_request`
3. `demo_access` on `/auth/complete?demo=1`

## 8. GA4 conversions

Mark as conversions (Admin → Events):

- `sign_up_confirmed`
- `demo_access`
- `begin_checkout` (plan intent — not signup)
- `contact`
- `generate_lead` (optional; filter by `lead_source`)

## 9. GDPR / Consent Mode v2

- Banner stores preferences in `localStorage` (`veta_cookie_consent`) and updates `gtag('consent', …)`.
- GTM is **not** injected until analytics is granted (`GtmScriptGate`).
- Categories: `ad_*`, `analytics_storage`, `functionality_storage`, `personalization_storage`, `security_storage`.
- Attribution cookie `veta_attribution` only when analytics accepted. See `src/lib/attribution.ts`.

## 10. References

- [GTM dataLayer](https://developers.google.com/tag-platform/tag-manager/web/datalayer)
- [GA4 recommended events](https://support.google.com/analytics/answer/9267738)
- App source of truth for event **names**: `GTM_EVENTS` in `src/lib/gtm.ts` (covered by `src/lib/gtm.test.ts`)
