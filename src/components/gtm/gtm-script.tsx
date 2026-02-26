"use client";

import Script from "next/script";
import { GTM_ID } from "@/lib/gtm";

/**
 * Injects the Google Tag Manager snippet per official install instructions:
 * - Head script as high as possible (beforeInteractive → head)
 * - Noscript iframe immediately after <body>
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
      {/* beforeInteractive is used only from root layout (app/layout.tsx); required for GTM official install */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script
        id="gtm-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: gtmScript }}
      />
    </>
  );
}
