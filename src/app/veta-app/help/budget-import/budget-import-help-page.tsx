"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { appPath } from "@/lib/app-paths";
import { BudgetImportHelp } from "@/modules/app/projects/budget-import/budget-import-help";
import { Button } from "@/components/ui/button";

export function BudgetImportHelpPage() {
  const t = useTranslations("ProjectModuleBudget");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Button variant="ghost" asChild className="px-0">
        <Link href={appPath("/projects")}>{t("importBack")}</Link>
      </Button>
      <BudgetImportHelp />
    </div>
  );
}
