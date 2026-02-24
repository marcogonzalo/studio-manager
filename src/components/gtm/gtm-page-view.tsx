"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { pushPageView } from "@/lib/gtm";

/**
 * Pushes a GA4 page_view to the dataLayer on route change (marketing SPA-like navigation).
 * Renders nothing.
 */
export function GtmPageView() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Avoid duplicate push on first mount if another component already pushed
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    pushPageView({
      path: pathname,
      title: typeof document !== "undefined" ? document.title : undefined,
      location:
        typeof window !== "undefined" ? window.location.href : undefined,
    });
  }, [pathname]);

  return null;
}
