---
name: veta-db-migrations
description: Safe Supabase migration workflow for Veta — local-only push/reset, SQL in supabase/migrations, RLS, and type updates. Use when creating migrations, running db push or db reset, or changing Postgres schema.
---

# Veta – Database migrations (Supabase)

## Scope

- **Migrations:** `supabase/migrations/*.sql` (ordered by timestamp prefix).
- **Local dev:** `npx supabase start` on the host; Docker may use `localhost:host-gateway` to reach Supabase (see `memory-bank/constraints.md`).
- **Production:** Schema changes reach Supabase Cloud via your normal release process (CI, dashboard, or approved `db push` to linked remote). **Never** assume the agent should run commands against production.

## Scripts (package.json)

- **`npm run db:push`** → `supabase db push --local` only. Use to apply pending migrations to the **local** database.
- **`npm run db:reset`** → `supabase db reset --local`. **Destructive** (drops local data). Run only when the user explicitly asks or agrees.

Do not change these scripts to remove `--local` without team approval.

## Creating a new migration

1. Add a new file under `supabase/migrations/` with a **timestamp prefix** newer than existing files, e.g. `YYYYMMDDHHMMSS_description.sql`.
2. Prefer **idempotent** patterns where safe (`if not exists`, conditional `DO` blocks) for tables/columns used across branches.
3. **Enable RLS** on every new table and add policies for `SELECT` / `INSERT` / `UPDATE` / `DELETE` as required. Follow `veta-supabase-rls` and `.cursor/rules/01-security.mdc`.
4. After schema changes, update TypeScript types the project uses (e.g. `src/types` or generated Supabase types) so the app stays type-safe.

## Commands reference

- Local status / diff: use Supabase CLI (`supabase migration list`, `supabase db diff`) as documented upstream when needed.
- If migration history drifts (e.g. renamed files): use `supabase migration repair` **carefully** and only with clear intent — document what was repaired.

## Do not

- Run `supabase link` to production or `db push` without `--local` unless the user explicitly requests remote operations and understands the impact.
- Apply ad-hoc SQL in production from a dev machine without going through reviewed migrations.
- Add tables without RLS.

## Related

- **`veta-supabase-rls`** — client usage and RLS expectations.
- **`veta-security-owasp`** — authz and data access boundaries.
