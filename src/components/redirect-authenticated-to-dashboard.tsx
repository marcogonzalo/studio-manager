"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * When on a marketing route (e.g. /) and the user has a session (e.g. after
 * magic link with redirect_to=origin), redirect to /dashboard.
 * Handles the case where Supabase redirects to the app root with session in hash.
 */
export function RedirectAuthenticatedToDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const supabase = getSupabaseClient();

    const checkAndRedirect = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          router.replace("/dashboard");
        }
      });
    };

    checkAndRedirect();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
