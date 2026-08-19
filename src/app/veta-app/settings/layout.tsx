import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAccountLocale } from "@/lib/account-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAccountLocale();
  const t = await getTranslations({ locale, namespace: "AppNav" });
  return { title: t("settings") };
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
