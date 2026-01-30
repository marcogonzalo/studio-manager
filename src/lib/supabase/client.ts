"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for the browser
 * Uses automatic document.cookie handling - no custom implementation needed
 * This is the recommended approach from @supabase/ssr documentation
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // No cookies config needed - createBrowserClient automatically uses document.cookie
  );
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

// Legacy export for backward compatibility during migration
export const supabase =
  typeof window !== "undefined" ? getSupabaseClient() : null!;
