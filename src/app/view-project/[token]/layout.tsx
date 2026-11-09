import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ViewProjectBrandingProvider } from "@/components/view-project-branding-provider";
import { loadViewProjectBranding } from "@/lib/view-project-branding";
import { getViewProjectLocale } from "@/lib/view-project-locale";

export default async function ViewProjectTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const [messages, branding] = await Promise.all([
    getMessages(),
    loadViewProjectBranding(token),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
      <ViewProjectBrandingProvider value={branding}>
        {children}
      </ViewProjectBrandingProvider>
    </NextIntlClientProvider>
  );
}
