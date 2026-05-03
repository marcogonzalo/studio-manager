import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { GtmScript } from "@/components/gtm";
import { CONSENT_STORAGE_KEY, getDefaultGtmConsent } from "@/lib/consent";
import {
  JsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
} from "@/components/json-ld";
import "@/styles/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://veta.pro");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Gestión de Proyectos de Diseño Interior",
    template: "%s | Veta",
  },
  description:
    "Plataforma integral para gestionar proyectos de diseño interior. Administra clientes, proveedores, catálogos y presupuestos en un solo lugar.",
  keywords: [
    "diseño interior",
    "gestión de proyectos",
    "diseño de interiores",
    "software diseño",
    "presupuestos",
    "catálogo productos",
  ],
  authors: [{ name: "Veta" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Veta",
    title: "Veta - Gestión de Proyectos de Diseño Interior",
    description:
      "Plataforma integral para gestionar proyectos de diseño interior.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Veta - Gestión de Proyectos de Diseño Interior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veta - Gestión de Proyectos de Diseño Interior",
    description:
      "Plataforma integral para gestionar proyectos de diseño interior.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/img/veta-favicon-light.png", type: "image/png" },
      {
        url: "/img/veta-favicon-dark.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/img/veta-favicon-light.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solo desarrollo: forzar global-error.tsx con cookie test-global-error=1
  if (process.env.NODE_ENV === "development") {
    const cookieStore = await cookies();
    if (cookieStore.get("test-global-error")?.value === "1") {
      throw new Error("Error de prueba para comprobar global-error.tsx");
    }
  }

  // Default consent when no stored preference (e.g. first visit or EU). Injected so inline script can use it.
  const defaultDeniedPayload = getDefaultGtmConsent(true);

  return (
    <html lang="es" suppressHydrationWarning className={montserrat.variable}>
      <head>
        {/* Aplicar tema antes del primer pintado para evitar que la 404 (y el resto) pierda formato al hidratar (next-themes aplica la clase después). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='theme';var t=localStorage.getItem(k);var s=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=!t||t==='system'?s:t==='dark';document.documentElement.classList.remove('light');document.documentElement.classList.toggle('dark',isDark);}catch(e){}})();`,
          }}
        />
        {/* Preconnect to third-party origins (faster TTFB, keeps third-party budget &lt; 200 KB). */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Consent default must be read from localStorage in the browser so returning users who already accepted get analytics_storage: granted before GTM/GA runs. Server cannot read localStorage, so we inject default-denied and let this script override from storage. */}
        <script
          id="gtm-consent-default"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
(function(){
  var key = ${JSON.stringify(CONSENT_STORAGE_KEY)};
  var defaultDenied = ${JSON.stringify(defaultDeniedPayload)};
  try {
    var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      var p = JSON.parse(raw);
      gtag('consent', 'default', {
        ad_storage: p.marketing ? 'granted' : 'denied',
        ad_user_data: p.marketing ? 'granted' : 'denied',
        ad_personalization: p.marketing ? 'granted' : 'denied',
        analytics_storage: p.analytics ? 'granted' : 'denied',
        functionality_storage: 'granted',
        personalization_storage: p.personalization ? 'granted' : 'denied',
        security_storage: 'granted'
      });
    } else {
      gtag('consent', 'default', defaultDenied);
    }
  } catch (e) {
    gtag('consent', 'default', defaultDenied);
  }
})();
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', false);
          `.trim(),
          }}
        />
      </head>
      <body className="bg-background min-h-screen font-sans antialiased">
        <GtmScript />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={softwareApplicationJsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
