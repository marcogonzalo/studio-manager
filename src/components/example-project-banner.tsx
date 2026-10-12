"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { appPath } from "@/lib/app-paths";

export function ExampleProjectBanner() {
  const t = useTranslations("ExampleProject");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary/10 border-primary/20 relative mb-4 rounded-lg border p-4">
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground focus:ring-primary absolute top-2 right-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        aria-label={t("dismiss")}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <Info className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">{t("title")}</p>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
          <Link href={appPath("/projects")}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("cta")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
