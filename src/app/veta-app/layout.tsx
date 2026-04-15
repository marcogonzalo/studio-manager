import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import AppLayoutClient from "@/components/layouts/app-layout";
import { AppFormattingProvider } from "@/components/providers/app-formatting-provider";
import { defaultLocale, type Locale } from "@/i18n/config";
import { appPath } from "@/lib/app-paths";
import {
  isAppDateFormatPattern,
  type AppDateFormatPattern,
} from "@/lib/formatting";
import { isAppLocale } from "@/lib/resolve-locale-from-accept-language";
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

  const { data: settings } = await supabase
    .from("account_settings")
    .select("lang, date_format")
    .eq("user_id", user.id)
    .maybeSingle();

  let locale: Locale = defaultLocale;
  let dateFormat: AppDateFormatPattern = "DD/MM/YYYY";
  if (settings) {
    if (isAppLocale(settings.lang)) locale = settings.lang as Locale;
    if (isAppDateFormatPattern(settings.date_format))
      dateFormat = settings.date_format;
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
      <AppFormattingProvider lang={locale} dateFormat={dateFormat}>
        <AuthProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </AuthProvider>
      </AppFormattingProvider>
    </NextIntlClientProvider>
  );
}
