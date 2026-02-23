import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseServerKey } from "./keys";
import { APP_BASE } from "../app-paths";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/contact",
  "/legal",
  "/auth",
  "/sitemap.xml",
  "/robots.txt",
];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/plan-")
  );
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isPublicPath(pathname)) {
    const res = NextResponse.next({ request });
    try {
      const supabaseUrl = getSupabaseUrl();
      const supabase = createServerClient(supabaseUrl, getSupabaseServerKey(), {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: CookieToSet[]) => {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        if (pathname === "/auth") {
          const url = request.nextUrl.clone();
          const redirectTo = request.nextUrl.searchParams.get("redirect");
          url.pathname = redirectTo
            ? decodeURIComponent(redirectTo)
            : `${APP_BASE}/dashboard`;
          url.searchParams.delete("redirect");
          const redirectRes = NextResponse.redirect(url);
          res.cookies
            .getAll()
            .forEach((cookie) =>
              redirectRes.cookies.set(cookie.name, cookie.value, cookie)
            );
          return redirectRes;
        }
        if (pathname === "/") {
          const url = request.nextUrl.clone();
          url.pathname = `${APP_BASE}/dashboard`;
          const redirectRes = NextResponse.redirect(url);
          res.cookies
            .getAll()
            .forEach((cookie) =>
              redirectRes.cookies.set(cookie.name, cookie.value, cookie)
            );
          return redirectRes;
        }
      }
    } catch {
      // Ignore auth errors on public routes
    }
    return res;
  }

  // Protected route: must have valid session
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    // CRITICAL: Must use the SAME URL as the client for PKCE cookies to work
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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    let user: { id: string } | null = null;
    try {
      const result = await supabase.auth.getUser();
      user = result.data.user;
    } catch {
      // Auth check failed (e.g. invalid/expired token, network) — treat as unauthenticated
      user = null;
    }

    function redirectWithCookies(url: URL) {
      const res = NextResponse.redirect(url);
      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) =>
          res.cookies.set(cookie.name, cookie.value, cookie)
        );
      return res;
    }

    // Redirect unauthenticated users trying to access protected routes (pages only)
    // For /api/* do not redirect: let the request reach the route (avoids POST → redirect → 405 on /auth)
    if (!user) {
      if (pathname.startsWith("/api/")) {
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      const redirectTo = encodeURIComponent(
        request.nextUrl.pathname + request.nextUrl.search
      );
      url.pathname = "/auth";
      url.searchParams.set("redirect", redirectTo);
      return redirectWithCookies(url);
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
  } catch {
    // Supabase init or auth failed (e.g. missing env, invalid/expired session)
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set(
      "redirect",
      encodeURIComponent(pathname + request.nextUrl.search)
    );
    return NextResponse.redirect(url);
  }
}
