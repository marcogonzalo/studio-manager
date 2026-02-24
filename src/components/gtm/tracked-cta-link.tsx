"use client";

import Link from "next/link";
import { pushCtaClick } from "@/lib/gtm";

type TrackedCtaLinkProps = React.ComponentProps<typeof Link> & {
  ctaLocation: string;
  ctaText: string;
};

/**
 * Link that pushes a cta_click event to the dataLayer on click.
 * Use for main CTAs (hero, benefits, final CTA) to measure funnel engagement.
 */
export function TrackedCtaLink({
  href,
  ctaLocation,
  ctaText,
  children,
  onClick,
  ...props
}: TrackedCtaLinkProps) {
  const destinationUrl =
    typeof href === "string" ? href : (href.pathname ?? undefined);

  return (
    <Link
      href={href}
      onClick={(e) => {
        pushCtaClick({
          cta_location: ctaLocation,
          cta_text: ctaText,
          destination_url: destinationUrl,
        });
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
