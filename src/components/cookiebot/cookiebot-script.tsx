"use client";

import Script from "next/script";

const COOKIEBOT_ID = "4340ad5d-1c36-47fb-b0ce-3660cb641ec6";

/**
 * Cookiebot consent management script.
 * Loads before other scripts (beforeInteractive) so consent can gate tracking.
 */
export function CookiebotScript() {
  return (
    <Script
      id="Cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid={COOKIEBOT_ID}
      data-blockingmode="auto"
      strategy="lazyOnload"
    />
  );
}
