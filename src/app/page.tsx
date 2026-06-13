import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildHomeMetadata } from "@/lib/marketing-home-metadata";
import HomeMarketingPage from "./[locale]/(marketing)/page";
import MarketingLayout from "./[locale]/(marketing)/layout";

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata(routing.defaultLocale);
}

export default async function RootPage() {
  const locale = routing.defaultLocale;

  // Root path is used for the default locale ("/" -> ES). We still need to
  // provide NextIntl context so client components (e.g. sections) work.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <MarketingLayout params={Promise.resolve({ locale })}>
        <HomeMarketingPage params={Promise.resolve({ locale })} />
      </MarketingLayout>
    </NextIntlClientProvider>
  );
}
