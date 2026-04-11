"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { VetaLogo } from "@/components/veta-logo";
import { ThemeToggleSimple } from "@/components/theme-toggle-simple";

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

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={t("homeAria")}
        >
          <VetaLogo height={28} />
        </Link>
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
