"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseClientKey } from "./keys";

/**
 * Creates a Supabase client for the browser
 * Uses automatic document.cookie handling - no custom implementation needed
 * This is the recommended approach from @supabase/ssr documentation
 *
 * Production: Uses Publishable Key (safe with RLS)
 * Local: Uses Anon Key
 */
export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseClientKey()
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
