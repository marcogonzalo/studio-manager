import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseUrl, getSupabaseServerKey } from "./keys";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Creates a Supabase client for server-side usage
 *
 * Production: Uses Secret Key (privileged backend access)
 * Local: Uses Anon Key
 */
export async function createClient() {
  const cookieStore = await cookies();

  // CRITICAL: Must use the SAME URL as the client for PKCE cookies to work
  // The cookie prefix is generated from the URL, so they must match exactly
  const supabaseUrl = getSupabaseUrl();

  return createServerClient(supabaseUrl, getSupabaseServerKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
