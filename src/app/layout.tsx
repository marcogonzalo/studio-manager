import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "StudioManager - Gestión de Proyectos de Diseño Interior",
    template: "%s | StudioManager",
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
  authors: [{ name: "StudioManager" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "StudioManager",
    title: "StudioManager - Gestión de Proyectos de Diseño Interior",
    description:
      "Plataforma integral para gestionar proyectos de diseño interior.",
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
    <html lang="es" suppressHydrationWarning>
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
