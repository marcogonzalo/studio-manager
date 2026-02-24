"use client";

import Script from "next/script";
import { GTM_ID } from "@/lib/gtm";

/**
 * Injects the Google Tag Manager snippet (head script + body noscript).
 * Renders nothing if NEXT_PUBLIC_GTM_ID is not set.
 */
export function GtmScript() {
  if (!GTM_ID) return null;

  const gtmScript = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),j.async=true,j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`;

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: gtmScript }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
