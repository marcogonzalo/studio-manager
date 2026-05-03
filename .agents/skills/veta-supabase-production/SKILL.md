---
name: veta-supabase-production
description: Safe Supabase production operations for Veta — no config push, no SQL, no migrations against the remote project unless the user explicitly requests and authorizes it. Use when any operation could affect the hosted Supabase project (studio-manager / veta.pro): config push, db push, execute_sql, migration apply, branch operations, or any MCP tool targeting the remote.
---

# Veta – Supabase production safety rules

## Hosted project

| Key | Value |
|-----|-------|
| Project name | studio-manager |
| Project ref | `pwpekrlojdhepreqybon` |
| Region | East US (Ohio) |
| Domain | veta.pro |
| Linked via CLI | Yes (`supabase projects list` shows `●`) |
| MCP server | `project-0-interior-design-project-supabase` |

---

## Hard rules — never do without explicit authorization

### 1. No `supabase config push` to production

`supabase config push` pushes the **entire `[auth]` section** of `config.toml` to the remote project — not just the section you edited. The `config.toml` in this repo is designed for **local development** (localhost URLs, relaxed passwords, MFA off, email confirmations off). Running it against the hosted project overwrites critical production settings:

- `site_url` → would become `http://localhost:3000` instead of `https://veta.pro`.
- `additional_redirect_urls` → would replace Vercel/production redirect list with localhost entries.
- `minimum_password_length` / `password_requirements` → would relax to local dev defaults.
- `enable_confirmations`, `secure_password_change` → would be disabled.
- `[auth.mfa.totp]` → would be disabled.

**Do not run `supabase config push` unless the user explicitly requests it, confirms awareness of the above, and has either aligned `config.toml` with production values or accepted the consequences.**

If the user asks to push config:
1. Show the diff between local and remote first (run `supabase config push --dry-run` or explain what will change).
2. Ask for explicit confirmation before proceeding.
3. After the push, revert `[auth]` in `config.toml` to local-dev values so `supabase start` keeps working.

### 2. No SQL queries against production

Do not run queries (INSERT, UPDATE, DELETE, DDL, RPC calls) against the hosted database — neither via the Supabase MCP `execute_sql` tool, nor via `supabase db push` targeting the remote, nor via any direct Postgres connection — unless the user explicitly requests it and confirms the target is production.

Read-only queries (`SELECT`) may be used to diagnose issues, but still require user confirmation that they intend to query production.

### 3. No migrations applied to production automatically

`supabase db push` (without `--local`) and `supabase migration apply` target the linked remote project. Only run them against production when the user explicitly asks. Prefer `--local` for all day-to-day development work (see `veta-db-migrations`).

---

## Production `[auth]` values (reference)

Use this table when the user authorizes a `config push` and you need to set `config.toml` to production values before pushing:

| `config.toml` key | Production value |
|-------------------|-----------------|
| `site_url` | `https://veta.pro` |
| `additional_redirect_urls` | `["https://studio-manager-eight.vercel.app/**", "https://veta-studio-manager.vercel.app/**", "https://veta.pro/**", "https://studio-manager-marcogonzalo-projects.vercel.app/", "https://studio-manager-marcogonzalo-projects.vercel.app/**", "https://studio-*-manager-marcogonzalo-projects.vercel.app", "https://studio-*-manager-marcogonzalo-projects.vercel.app/**"]` |
| `minimum_password_length` | `12` |
| `password_requirements` | `lower_upper_letters_digits_symbols` |
| `[auth.email] enable_confirmations` | `true` |
| `[auth.email] secure_password_change` | `true` |
| `[auth.email] max_frequency` | `10s` |
| `[auth.email] otp_length` | `8` |
| `[auth.rate_limit] token_refresh` | `5` |
| `[auth.mfa.totp] enroll_enabled` | `true` |
| `[auth.mfa.totp] verify_enabled` | `true` |

After a `config push` with these values, **revert `config.toml` to local-dev defaults** so `supabase start` works normally again.

---

## Safe alternatives for common tasks

| Goal | Safe approach |
|------|--------------|
| Update email template HTML or subject | Dashboard → Authentication → Email Templates (manual, always safe) |
| Apply schema change to production | Reviewed PR → CI/CD pipeline, or explicit `supabase db push` after user confirmation |
| Read data for diagnosis | Dashboard → Table Editor / SQL Editor, or ask user to run the query |
| Inspect auth config diff | `supabase config push --dry-run` (shows diff, does not apply) — still confirm intent |

---

## Related skills

- **`veta-db-migrations`** — migration workflow (always `--local` by default).
- **`veta-supabase-rls`** — client usage and RLS.
- **`veta-security-owasp`** — security boundaries and data access.
