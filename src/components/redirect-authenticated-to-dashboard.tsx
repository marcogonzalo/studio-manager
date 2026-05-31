"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { appPath } from "@/lib/app-paths";

/**
 * When on a marketing route (e.g. /) and the user has a session (e.g. after
 * magic link with redirect_to=origin), redirect to the app dashboard.
 * Handles the case where Supabase redirects to the app root with session in hash.
 */
export function RedirectAuthenticatedToDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const supabase = getSupabaseClient();
    const dashboardPath = appPath("/dashboard");
    let subscription: { unsubscribe: () => void } | undefined;

    const start = () => {
      supabase.auth
        .getSession()
        .then((res: { data: { session: { user?: unknown } | null } }) => {
          const session = res.data.session;
          if (session?.user) {
            router.replace(dashboardPath);
          }
        });

      const { data } = supabase.auth.onAuthStateChange(
        (_event: string, session: { user?: unknown } | null) => {
          if (session?.user) {
            router.replace(dashboardPath);
          }
        }
      );
      subscription = data.subscription;
    };

    const idleId =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback(start)
        : window.setTimeout(start, 1);

    return () => {
      if (typeof cancelIdleCallback === "function") {
        cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      subscription?.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
