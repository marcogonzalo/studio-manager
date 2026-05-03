---
name: veta-supabase-email-templates
description: Manage Supabase Auth email templates and config.toml for Veta — bilingual ES/EN bodies, English-only subjects, safe config push to production without overwriting auth settings. Use when editing supabase/templates/*.html, config.toml email sections, email subjects, or deploying auth templates to hosted Supabase.
---

# Veta – Supabase Auth email templates

## File locations

| What | Where |
|------|-------|
| HTML templates | `supabase/templates/*.html` |
| Subjects + content_paths | `supabase/config.toml` → `[auth.email.template.*]` and `[auth.email.notification.*]` |
| Doc reference | `docs/supabase-email-templates.md` |

## Language: bilingual body, English subject

- **Body:** HTML bifurcates ES ↔ EN using Go templates and `user_metadata.lang`:
  ```html
  {{ if and .Data (eq .Data.lang "en") }}English copy{{ else }}Copia en español{{ end }}
  ```
- **Subject:** a single English string per template type. Never bilingual `ES | EN` pipes.
- **`<html lang>` attribute:** use **single quotes** so the Go literal `"en"` does not break the attribute:
  ```html
  <html lang='{{ if and .Data (eq .Data.lang "en") }}en{{ else }}es{{ end }}'>
  ```
  Double-quoting the attribute would make `"en"` inside the Go expression terminate the attribute early.

## Where `lang` comes from

`user_metadata.lang` is written by:
- **`/api/auth/magic-link`** — reads `body.lang` or `Accept-Language` via `resolveEmailLocale`.
- **`/api/auth/demo-request`** — same.
- **Sign-in / sign-up forms** — pass `lang` in `signInWithOtp` / `signUp` `data`.
- **Settings → customization** — `auth.updateUser({ data: { lang } })` on save.
- **Settings → account (email change)** — `auth.updateUser({ data: { lang } })` alongside the email update.

`resolveEmailLocale` (`src/lib/email/auth-email-lang.ts`) picks the explicit `lang` if valid, otherwise parses the `Accept-Language` header.

## Internal notification emails (MailerSend)

Inbox/admin notifications (demo-request, contact) are **Spanish-only**, regardless of the visitor's locale. Only the field value `Idioma (locale):` shows the locale string.

- Interpolated user-controlled values (email, lang, dates) **must** be escaped with `escapeHtml` from `src/lib/escape-html.ts` before embedding in HTML strings.

```ts
import { escapeHtml } from "@/lib/escape-html";
// ...
html: `<p>Visitante: ${escapeHtml(email)}</p><p>Idioma (locale): ${escapeHtml(lang)}</p>`
```

## Subjects (current, English-only)

| Template | Subject |
|----------|---------|
| confirmation | `Confirm your account — Veta` |
| invite | `Invitation to Veta` |
| recovery | `Reset your password — Veta` |
| magic_link | `Your sign-in link — Veta` |
| email_change | `Confirm email change — Veta` |
| reauthentication | `Confirm your identity — Veta` |
| password_changed (notification) | `Password updated — Veta` |
| email_changed (notification) | `Email updated — Veta` |

## Prettier

HTML templates use Go syntax inside HTML attributes; Prettier breaks them. Templates are excluded from formatting:

```
# .prettierignore
supabase/templates
```

Never run `prettier --write` on `supabase/templates/`.

---

## Deploying to production (hosted Supabase)

> **Project:** `pwpekrlojdhepreqybon` (studio-manager), linked via Supabase CLI.

### ⚠️ Critical: `supabase config push` overwrites ALL of `[auth]`

`supabase config push` sends the **entire** `[auth]` section from `config.toml` to the remote project — not just templates. The `config.toml` in this repo is designed for **local development** (localhost URLs, relaxed password policy, MFA off, email confirmations off). Running `config push` without adjusting those values **will overwrite production settings**.

### Safe deploy workflow

**Option A — Management API (safest, templates only):**
Use `PATCH /v1/projects/$PROJECT_REF/config/auth` with only `mailer_*` fields:
```bash
curl -X PATCH "https://api.supabase.com/v1/projects/pwpekrlojdhepreqybon/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_confirmation": "Confirm your account — Veta",
    "mailer_templates_confirmation_content": "<full HTML>",
    ...
  }'
```
Only template fields are touched; all other Auth settings are untouched.

**Option B — Dashboard (manual, always safe):**
1. Dashboard → Authentication → Email Templates.
2. Paste subject and HTML for each type.
3. Enable Password changed / Email changed notifications in Auth settings.

**Option C — `supabase config push` (use with care):**
Before running, align `[auth]` in `config.toml` with production values:

| Setting | Production value |
|---------|-----------------|
| `site_url` | `https://veta.pro` |
| `additional_redirect_urls` | Vercel preview + `https://veta.pro/**` |
| `minimum_password_length` | `12` |
| `password_requirements` | `lower_upper_letters_digits_symbols` |
| `enable_confirmations` | `true` |
| `secure_password_change` | `true` |
| `max_frequency` | `10s` |
| `otp_length` | `8` |
| `token_refresh` (rate limit) | `5` |
| `[auth.mfa.totp] enroll_enabled` | `true` |
| `[auth.mfa.totp] verify_enabled` | `true` |

After the push, **revert** those values in `config.toml` to their local-dev defaults so `supabase start` works normally.

### Checklist before any template change

- [ ] Template uses `lang='{{ if and .Data (eq .Data.lang "en") }}en{{ else }}es{{ end }}'` (single-quoted attribute).
- [ ] All user-controlled strings in internal HTML are escaped with `escapeHtml`.
- [ ] Subjects are English-only (no `ES | EN` pipe pattern).
- [ ] `.prettierignore` includes `supabase/templates`.
- [ ] If using `config push`: production `[auth]` values are set in `config.toml` before push and reverted after.

## Related skills

- **`veta-supabase-rls`** — client usage, RLS.
- **`veta-db-migrations`** — schema migrations safe workflow.
- **`veta-security-owasp`** — HTML injection, escaping, OWASP.
