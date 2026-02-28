import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { GtmScript } from "@/components/gtm";
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

  return (
    <html lang="es" suppressHydrationWarning className={montserrat.variable}>
      <head>
        {/* Preconnect to third-party origins used on marketing and app for faster TTFB/LCP */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://consent.cookiebot.com" />
        <link rel="dns-prefetch" href="https://consentcdn.cookiebot.com" />
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
