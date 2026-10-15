"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { AppAnnouncementBanner } from "@/components/app-announcement-banner";

export function demoSignUpHref(locale: Locale | string): string {
  return locale === "en" ? "/en/sign-up" : "/sign-up";
}

/** Demo-session notice rendered inside the shared app announcement bar. */
export function DemoAccountBanner() {
  const t = useTranslations("DemoAccountBanner");
  const locale = useLocale();
  const href = demoSignUpHref(locale);

  return (
    <AppAnnouncementBanner>
      <span>{t("lead")} </span>
      <Link
        href={href}
        className="text-primary font-medium underline underline-offset-2 hover:opacity-90"
      >
        {t("cta")}
      </Link>
      <span> {t("tail")}</span>
    </AppAnnouncementBanner>
  );
}
