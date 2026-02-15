import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
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
    : "https://veta.app");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Veta - Gestión de Proyectos de Diseño Interior",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={montserrat.variable}>
      <body className="bg-background min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
