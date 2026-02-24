import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import AppLayoutClient from "@/components/layouts/app-layout";
import { appPath } from "@/lib/app-paths";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { template: "%s", default: "App" },
  description:
    "Gestiona proyectos de diseño de interiores, clientes, presupuestos y catálogo.",
  robots: {
    index: false,
    follow: false,
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

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in?redirect=" + encodeURIComponent(appPath("/dashboard")));
  }
  return (
    <AuthProvider>
      <AppLayoutClient>{children}</AppLayoutClient>
    </AuthProvider>
  );
}
