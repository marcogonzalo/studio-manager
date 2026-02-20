import { type NextRequest } from "next/server";
import { checkRateLimit, getClientIp, getRouteGroup } from "@/lib/rate-limit";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const routeGroup = getRouteGroup(pathname);
  if (routeGroup) {
    const ip = getClientIp(request);
    const { allowed, remaining, resetAt } = checkRateLimit(ip, routeGroup);
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(1, retryAfter)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
