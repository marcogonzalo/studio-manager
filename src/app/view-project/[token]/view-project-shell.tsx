"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { VetaLogo } from "@/components/veta-logo";
import { ThemeToggleSimple } from "@/components/theme-toggle-simple";
import { useViewProjectBranding } from "@/components/view-project-branding-provider";

export function ViewProjectShell({
  token,
  showBack,
  title,
  children,
}: {
  token: string;
  showBack?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("ViewProject");
  const branding = useViewProjectBranding();
  const showAccountBrand =
    branding.accountBranding &&
    Boolean(branding.brandLogoUrl || branding.brandName);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        {showAccountBrand ? (
          <div
            className="flex min-w-0 items-center gap-2"
            aria-label={branding.brandName ?? t("homeAria")}
          >
            {branding.brandLogoUrl ? (
              <span className="relative h-7 w-14 shrink-0">
                <Image
                  src={branding.brandLogoUrl}
                  alt={branding.brandName ?? ""}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </span>
            ) : null}
            {branding.brandName ? (
              <span className="text-foreground truncate text-base font-medium tracking-wide">
                {branding.brandName}
              </span>
            ) : null}
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={t("homeAria")}
          >
            <VetaLogo height={28} />
          </Link>
        )}
        <ThemeToggleSimple />
      </header>
      <main className="flex flex-1 flex-col px-4 py-6">
        {showBack && (
          <div className="mb-4">
            <Link
              href={`/view-project/${token}`}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {t("backToProject")}
            </Link>
          </div>
        )}
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {title && (
            <h1 className="text-foreground text-xl font-semibold">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
