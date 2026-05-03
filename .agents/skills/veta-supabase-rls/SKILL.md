---
name: veta-supabase-rls
description: Use Supabase client correctly in the Veta project (browser vs server), enforce RLS and typed access. Use when writing or reviewing code that uses Supabase, createClient, getSupabaseClient, RLS, or row-level security.
---

# Veta – Supabase client & RLS

## Client vs server

- **Client (browser):** `import { getSupabaseClient } from '@/lib/supabase'` or `import { createClient } from '@/lib/supabase'`. Use in Client Components and client-side code.
- **Server (RSC / API / Server Actions):** `import { createClient } from '@/lib/supabase/server'`. Never import `@/lib/supabase` (index) in server code — it re-exports browser client only.
- **Middleware:** `import { updateSession } from '@/lib/supabase/middleware'` for auth session.

## Types

- Import DB types from `@/types` or generated Supabase types. Keep shared interfaces in `src/types/index.ts` to avoid circular imports from components.

## Error handling

- Always check `error` from Supabase calls. Surface errors to the user (e.g. toast) when appropriate.

```ts
const { data, error } = await supabase.from("table").select();
if (error) {
  // handle: toast.error(error.message) or return error response
}
```

## Security

- Never expose Service Role Key or `SUPABASE_SERVICE_ROLE_KEY` on the client. Use only in server-side code when bypassing RLS is required (e.g. admin operations).
- Every table must have RLS enabled and policies for SELECT/INSERT/UPDATE/DELETE. Do not rely only on client-side checks.
