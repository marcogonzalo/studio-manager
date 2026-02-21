"use client";

import * as React from "react";
import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SMOOTH_SCROLL_DURATION_MS = 1500; // 0.5s slower than default ~1s

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function smoothScrollToId(
  id: string,
  durationMs: number = SMOOTH_SCROLL_DURATION_MS
) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = window.scrollY;
  const target = el.getBoundingClientRect().top + start;
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    const eased = easeOutCubic(t);
    window.scrollTo(0, start + (target - start) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

interface SmoothScrollLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href: string;
  durationMs?: number;
  children: React.ReactNode;
}

/**
 * Link that scrolls to the target id with a custom duration (default 1.5s).
 * Use for in-page anchors when you want slower smooth scroll.
 */
export const SmoothScrollLink = React.forwardRef<
  HTMLAnchorElement,
  SmoothScrollLinkProps
>(function SmoothScrollLink(
  {
    href,
    durationMs = SMOOTH_SCROLL_DURATION_MS,
    children,
    className,
    ...props
  },
  ref
) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href.startsWith("#")) return;
      const id = href.slice(1);
      if (!id) return;
      e.preventDefault();
      smoothScrollToId(id, durationMs);
    },
    [href, durationMs]
  );

  return (
    <a
      ref={ref}
      href={href}
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
});

/**
 * For href like "/#features" or "#features": same page uses 1.5s smooth scroll;
 * other pages use Next.js Link so nav then scroll matches.
 */
export function AnchorToHash({
  href,
  children,
  className,
  ...props
}: Omit<SmoothScrollLinkProps, "durationMs"> & { href: string }) {
  const pathname = usePathname();
  const isPathHash = href.startsWith("/#");
  const [path, hash] = isPathHash
    ? [href.slice(0, href.indexOf("#")), href.slice(href.indexOf("#") + 1)]
    : ["", href.startsWith("#") ? href.slice(1) : ""];
  const samePage = path === pathname || (path === "" && pathname === "/");
  const hashId = hash || (href.startsWith("#") ? href.slice(1) : "");

  if (hashId && samePage) {
    return (
      <SmoothScrollLink href={`#${hashId}`} className={className} {...props}>
        {children}
      </SmoothScrollLink>
    );
  }
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
