"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";

export function demoSignUpHref(locale: Locale | string): string {
  return locale === "en" ? "/en/sign-up" : "/sign-up";
}

export function DemoAccountBanner() {
  const t = useTranslations("DemoAccountBanner");
  const locale = useLocale();
  const href = demoSignUpHref(locale);

  return (
    <div
      role="status"
      className="border-border bg-primary/10 text-foreground w-full border-b px-4 py-2 text-center text-sm"
    >
      <span>{t("lead")} </span>
      <Link
        href={href}
        className="text-primary font-medium underline underline-offset-2 hover:opacity-90"
      >
        {t("cta")}
      </Link>
      <span> {t("tail")}</span>
    </div>
  );
}
