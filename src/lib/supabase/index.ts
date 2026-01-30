/**
 * Supabase client exports (client-side only)
 *
 * This file exports only client-side Supabase utilities.
 *
 * Client-side usage:
 *   import { supabase, getSupabaseClient } from '@/lib/supabase';
 *
 * Server-side usage (import directly):
 *   import { createClient } from '@/lib/supabase/server';
 *
 * Middleware usage (import directly):
 *   import { updateSession } from '@/lib/supabase/middleware';
 */

// Client-side exports only (browser)
// Note: Server-side exports are NOT included here to avoid importing
// 'next/headers' in client components, which causes build errors.
export { createClient, getSupabaseClient, supabase } from "./client";
