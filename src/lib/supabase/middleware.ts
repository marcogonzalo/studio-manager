import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // CRITICAL: Must use the SAME URL as the client for PKCE cookies to work
  // The cookie prefix is generated from the URL, so they must match exactly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
    "/auth",
  ];

  // Allow auth routes (including callback) to be accessed without authentication
  const isPublicRoute =
    publicRoutes.some((route) => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/auth");

  // Redirect unauthenticated users trying to access protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    const redirectTo = encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search
    );
    url.pathname = "/auth";
    url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth page to dashboard
  if (user && request.nextUrl.pathname === "/auth") {
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    url.pathname = redirectTo ? decodeURIComponent(redirectTo) : "/dashboard";
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
