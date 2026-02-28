import { type NextRequest } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  getRouteGroup,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const routeGroup = getRouteGroup(pathname);
  if (routeGroup) {
    const ip = getClientIp(request);
    const { allowed, resetAt } = checkRateLimit(ip, routeGroup);
    if (!allowed) {
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
  return await updateSession(request);
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
