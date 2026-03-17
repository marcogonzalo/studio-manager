"use client";

import { useLocale } from "next-intl";
import { Globe2 } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale: Locale = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      aria-label={`Switch to ${locale === "en" ? "Español" : "English"}`}
      className="gap-1.5 text-sm font-medium"
    >
      <Globe2 className="h-4 w-4" />
      {locale === "en" ? "ES" : "EN"}
    </Button>
  );
}
