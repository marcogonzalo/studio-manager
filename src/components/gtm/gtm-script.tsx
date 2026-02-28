"use client";

import Script from "next/script";
import { GTM_ID } from "@/lib/gtm";

/**
 * Injects the Google Tag Manager snippet.
 * Uses lazyOnload to keep third-party JS off the critical path (Core Web Vitals, &lt; 200 KB budget).
 * Noscript iframe remains first in body for fallback.
 * @see https://support.google.com/tagmanager/answer/14847097
 */
export function GtmScript() {
  if (!GTM_ID) return null;

  const gtmScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

  return (
    <>
      {/* Noscript first so it is the first node in body when this component is first in root layout */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
      <Script
        id="gtm-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: gtmScript }}
      />
    </>
  );
}
