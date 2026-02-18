/**
 * Supabase API Keys Configuration
 *
 * Production: Uses Publishable Key (client) and Secret Key (server)
 * Local: Uses Anon Key for both (development)
 */

/**
 * Determines if we're running in production
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production" && !!process.env.VERCEL;
}

/**
 * Gets the Supabase URL
 */
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!;
}

/**
 * Gets the client-side Supabase key (browser-safe)
 * - Production: Publishable Key (safe with RLS enabled)
 * - Local: Anon Key
 */
export function getSupabaseClientKey(): string {
  if (isProduction()) {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
}

/**
 * Gets the server-side Supabase key (backend only)
 * - Production: Secret Key (privileged access)
 * - Local: Anon Key
 */
export function getSupabaseServerKey(): string {
  if (isProduction()) {
    return (
      process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
}
