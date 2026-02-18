import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseServerKey } from "@/lib/supabase/keys";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam ? decodeURIComponent(nextParam) : "/dashboard";

  if (code) {
    const redirectPath = next.startsWith("/") ? next : `/${next}`;
    const supabaseResponse = NextResponse.redirect(`${origin}${redirectPath}`);

    // CRITICAL: Must use the SAME URL as the client for PKCE cookies to work
    // The cookie prefix is generated from the URL, so they must match exactly
    const supabaseUrl = getSupabaseUrl();

    const supabase = createServerClient(supabaseUrl, getSupabaseServerKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return supabaseResponse;
    }

    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message || "Could not authenticate user")}`
    );
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/auth?error=${encodeURIComponent("No authentication code provided")}`
  );
}
