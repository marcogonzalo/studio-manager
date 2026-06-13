# Scripts

## supabase-local.mjs

Arranque local de Supabase con menos consumo de RAM.

| Comando                        | Descripción                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| `pnpm run supabase:start:slim` | Core: API, Auth, Postgres (sin Studio, Inbucket, Realtime, Storage…) |
| `pnpm run supabase:studio`     | Añade Studio (dashboard) — requiere core en marcha                   |
| `pnpm run supabase:mail`       | Añade Inbucket (emails locales) — requiere core en marcha            |
| `pnpm run supabase:start`      | Stack completo (equivalente a `supabase start` sin excludes)         |
| `pnpm run supabase:status`     | URL, anon key, service role                                          |
| `pnpm run supabase:stop`       | Para todos los contenedores locales                                  |

Tras **slim**, opcional:

```bash
pnpm run supabase:studio   # http://127.0.0.1:54323
pnpm run supabase:mail     # http://127.0.0.1:54324
```

Si ya tenías el stack completo y quieres slim, para primero: `pnpm run supabase:stop`.

## seed-demo-account.ts

Seed or reset the demo account (`demo@veta.pro`) with Studio plan and sample data (3 clients, 7 suppliers, 2 projects with spaces, items, fees, costs, purchase orders, payments, notes).

**Run (from project root):**

```bash
pnpm run seed:demo
```

Con Supabase local en marcha (`pnpm run supabase:start:slim`), el comando lee `API_URL` y `SERVICE_ROLE_KEY` de `supabase status --output json`. También puedes fijar tú las variables y se respetan:

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> pnpm exec tsx scripts/seed-demo-account.ts
```

- **Local:** Tras `pnpm run supabase:start:slim`, `pnpm run seed:demo` suele bastar (lee `API_URL` y `SERVICE_ROLE_KEY` de `supabase status`; no mezcla una variable de entorno con otra del status: o defines **las dos** `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, o ninguna). A mano: mismas claves en el JSON de `supabase status`.
- **Cloud:** Use your project's API URL and Service Role key from Supabase Dashboard → Settings → API.

The script is idempotent: it deletes existing demo data then re-seeds. It creates the demo user via Auth Admin if it does not exist.

## verify-demo-account.ts

Checks that the demo account has exactly the row counts produced by `seed-demo-account.ts` (no missing or extra rows).

**Run:** Same env as seed.

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> pnpm exec tsx scripts/verify-demo-account.ts
```

- **Expected counts** are documented in [scripts/SEED-DEMO-EXPECTED.md](SEED-DEMO-EXPECTED.md). If verification fails, run the seed again to reset demo data.
