import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { getViewProjectLocale } from "@/lib/view-project-locale";

export default async function ViewProjectTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
