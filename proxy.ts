import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import {
  checkRateLimit,
  getClientIp,
  getRouteGroup,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) Rate limiting (para todas las rutas que pasan por el proxy)
  const routeGroup = getRouteGroup(pathname, request.method);
  if (routeGroup) {
    const ip = getClientIp(request);
    const { allowed, resetAt } = checkRateLimit(ip, routeGroup);
    if (!allowed) {
      // If logging rate-limit events for view-project, use maskViewProjectPath(pathname) so the share token is never logged in full.
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return new Response(JSON.stringify({ error: RATE_LIMIT_MESSAGE }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.max(1, retryAfter)),
          "X-RateLimit-Remaining": "0",
        },
      });
    }
  }

  // 2) Rutas internas de app/API → solo auth Supabase (sin i18n)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/veta-app/") ||
    pathname.startsWith("/view-project/")
  ) {
    return await updateSession(request);
  }

  // 3) Rutas de marketing/auth → i18n (prefijos /en, /es, redirects, alternate links)
  //    El middleware de next-intl se encarga de la negociación de idioma y prefijos.
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (build output)
     * - _vercel (Vercel Analytics/Speed Insights scripts; avoid auth redirect + enable cache)
     * - favicon.ico, public image assets
     */
    "/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
