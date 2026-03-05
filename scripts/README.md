# Scripts

## seed-demo-account.ts

Seed or reset the demo account (`demo@veta.pro`) with Studio plan and sample data (3 clients, 7 suppliers, 2 projects with spaces, items, fees, costs, purchase orders, payments, notes).

**Run (from project root):**

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-demo-account.ts
```

- **Local:** After `npx supabase start`, use the URL and **Secret** key from `npx supabase status` (Project URL + Secret under Authentication Keys).
- **Cloud:** Use your project's API URL and Service Role key from Supabase Dashboard → Settings → API.

The script is idempotent: it deletes existing demo data then re-seeds. It creates the demo user via Auth Admin if it does not exist.

## verify-demo-account.ts

Checks that the demo account has exactly the row counts produced by `seed-demo-account.ts` (no missing or extra rows).

**Run:** Same env as seed.

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/verify-demo-account.ts
```

- **Expected counts** are documented in [scripts/SEED-DEMO-EXPECTED.md](SEED-DEMO-EXPECTED.md). If verification fails, run the seed again to reset demo data.
